import axios from "axios";
import dotenv from "dotenv";
import { User } from "../models/userModel.js";
import { calculateDistance } from "../utils/haversine.js";

dotenv.config();

const OPENROUTESERVICE_API_KEY = process.env.OPENROUTESERVICE_API_KEY;
const OPENROUTESERVICE_BASE_URL = "https://api.openrouteservice.org";

// Get nearest riders with distance calculation
export const getNearestRiders = async (req, res) => {
  try {
    const { latitude, longitude, maxDistanceKm = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Please provide latitude and longitude as query parameters",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: "Invalid latitude or longitude values",
      });
    }

    // Find all available riders with location data
    const allRiders = await User.find({
      role: "rider",
      status: "available",
      is_available: true,
      latitude: { $ne: null },
      longitude: { $ne: null },
    }).select(
      "full_name email phone rating vehicle_type license_plate latitude longitude"
    );

    if (allRiders.length === 0) {
      return res.status(200).json({
        success: true,
        origin: { latitude: lat, longitude: lng },
        count: 0,
        riders: [],
      });
    }

    // Calculate distances using Haversine formula (always available)
    let ridersWithDistance = allRiders.map((rider) => {
      const distance = calculateDistance(
        lat,
        lng,
        rider.latitude,
        rider.longitude
      );
      return {
        _id: rider._id,
        full_name: rider.full_name,
        email: rider.email,
        phone: rider.phone,
        rating: rider.rating,
        vehicle_type: rider.vehicle_type,
        license_plate: rider.license_plate,
        location: {
          latitude: rider.latitude,
          longitude: rider.longitude,
        },
        distance_km: distance,
      };
    });

    // Optionally enhance with OpenRouteService for more accurate road distances
    if (OPENROUTESERVICE_API_KEY && ridersWithDistance.length > 0) {
      try {
        const enhancedDistances = await getDistancesWithOpenRouteService(
          { latitude: lat, longitude: lng },
          ridersWithDistance
        );

        // Merge enhanced distances (keeping rider info)
        ridersWithDistance = enhancedDistances.map((enhanced, idx) => {
          const original = ridersWithDistance[idx];
          return {
            ...original,
            distance_km: enhanced.distance_km || original.distance_km,
            duration_seconds: enhanced.duration_seconds,
            duration_text: enhanced.duration_text,
          };
        });
      } catch (orsError) {
        console.warn(
          "OpenRouteService enhancement failed, using Haversine:",
          orsError.message
        );
        // Continue with Haversine distances
      }
    }

    // Filter by max distance and sort by distance
    let nearby = ridersWithDistance;
    if (maxDistanceKm) {
      nearby = ridersWithDistance.filter(
        (r) => r.distance_km <= parseFloat(maxDistanceKm)
      );
    }

    nearby.sort((a, b) => a.distance_km - b.distance_km);

    res.status(200).json({
      success: true,
      origin: { latitude: lat, longitude: lng },
      count: nearby.length,
      riders: nearby,
    });
  } catch (err) {
    console.error("Error calculating nearest riders:", err.message);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
};

// Get accurate distances using OpenRouteService Matrix API
export const getDistancesWithOpenRouteService = async (
  origin,
  destinations
) => {
  try {
    if (!OPENROUTESERVICE_API_KEY) {
      // Fallback to Haversine if no API key
      return destinations.map((dest) => ({
        ...dest,
        distance_km: dest.distance_km,
        distanceValue: dest.distance_km * 1000,
      }));
    }

    // OpenRouteService Matrix API expects locations in [lng, lat] format
    const locations = [
      [origin.longitude, origin.latitude],
      ...destinations.map((dest) => [
        dest.location?.longitude || dest.longitude || 0,
        dest.location?.latitude || dest.latitude || 0,
      ]),
    ];

    // Determine profile based on vehicle type (default to driving-car)
    // For motorcycle/bicycle, we could use 'driving-motorcycle' or 'cycling-regular'
    const profile = "driving-car"; // Can be: driving-car, driving-motorcycle, cycling-regular, etc.

    const response = await axios.post(
      `${OPENROUTESERVICE_BASE_URL}/v2/matrix/${profile}`,
      {
        locations: locations,
        metrics: ["distance", "duration"],
      },
      {
        headers: {
          // OpenRouteService expects the API key in the Authorization header (no Bearer prefix)
          Authorization: `${OPENROUTESERVICE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { distances, durations } = response.data;

    // distances[0] contains distances from origin (index 0) to all destinations
    // durations[0] contains durations from origin to all destinations
    if (!distances || !distances[0]) {
      throw new Error("Invalid response from OpenRouteService");
    }

    return destinations.map((dest, i) => {
      const distanceMeters = distances[0]?.[i + 1] || 0; // +1 because first is origin
      const durationSeconds = durations[0]?.[i + 1] || 0;
      const distanceKm = (distanceMeters / 1000).toFixed(2);

      return {
        ...dest,
        distance_km: parseFloat(distanceKm),
        distanceValue: distanceMeters,
        duration_seconds: durationSeconds,
        duration_text: formatDuration(durationSeconds),
      };
    });
  } catch (err) {
    console.error(
      "Error fetching distances from OpenRouteService:",
      err.message
    );
    // Fallback to Haversine calculation
    return destinations.map((dest) => ({
      ...dest,
      distance_km: dest.distance_km || 0,
      distanceValue: (dest.distance_km || 0) * 1000,
    }));
  }
};

// Geocoding: Convert address to coordinates
export const geocodeAddress = async (address) => {
  try {
    if (!OPENROUTESERVICE_API_KEY) {
      throw new Error("OpenRouteService API key not configured");
    }

    // Use the geocode search endpoint
    const response = await axios.get(
      `${OPENROUTESERVICE_BASE_URL}/geocode/search`,
      {
        params: {
          text: address,
        },
        headers: {
          Authorization: `${OPENROUTESERVICE_API_KEY}`,
        },
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      const feature = response.data.features[0];
      const [lng, lat] = feature.geometry.coordinates;
      return {
        latitude: lat,
        longitude: lng,
        address: feature.properties.label || feature.properties.name || address,
        formatted_address:
          feature.properties.label || feature.properties.name || address,
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error.message || error);
    throw error;
  }
};

// Reverse geocoding: Convert coordinates to address
export const reverseGeocode = async (latitude, longitude) => {
  try {
    if (!OPENROUTESERVICE_API_KEY) {
      throw new Error("OpenRouteService API key not configured");
    }

    // OpenRouteService reverse geocoding expects the point as "lng,lat"
    const response = await axios.get(
      `${OPENROUTESERVICE_BASE_URL}/geocode/reverse`,
      {
        params: {
          point: `${longitude},${latitude}`,
        },
        headers: {
          Authorization: `${OPENROUTESERVICE_API_KEY}`,
        },
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      const feature = response.data.features[0];
      return {
        address: feature.properties.label || feature.properties.name,
        formatted_address: feature.properties.label || feature.properties.name,
        latitude,
        longitude,
      };
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error.message || error);
    throw error;
  }
};

// Helper function to format duration in seconds to readable text
function formatDuration(seconds) {
  if (!seconds) return "Unknown";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}
