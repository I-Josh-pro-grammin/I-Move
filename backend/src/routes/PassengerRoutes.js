import express from "express";
import {
  getNearestRiders,
  geocodeAddress,
  reverseGeocode,
} from "../config/openRouteService.js";
import {
  requestRide,
  getMyRides,
  getRideStatus,
} from "../controllers/passengerController.js";
import { calculateDistance, calculateFare } from "../utils/haversine.js";
import { authenticate } from "../midelwares/Authentication.js";

const router = express.Router();

// Get nearby riders - requires authentication
router.get("/nearby-riders", authenticate, getNearestRiders);

// Calculate fare estimate
router.post("/fare-estimate", authenticate, (req, res) => {
  try {
    const { pickup_lat, pickup_lng, dropoff_lat, dropoff_lng } = req.body;

    if (!pickup_lat || !pickup_lng || !dropoff_lat || !dropoff_lng) {
      return res.status(400).json({
        success: false,
        message: "Missing required coordinates",
      });
    }

    const distance_km = calculateDistance(
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng
    );
    const estimated_fare = calculateFare(distance_km);

    res.status(200).json({
      success: true,
      distance_km,
      estimated_fare,
      currency: "KES", // You can change this to your currency
    });
  } catch (err) {
    console.error("Fare estimate error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Request a ride - requires authentication
router.post("/ride", authenticate, requestRide);

// Get passenger's rides - requires authentication
router.get("/rides", authenticate, getMyRides);

// Get specific ride status - requires authentication
router.get("/ride/:rideId", authenticate, getRideStatus);

// Geocoding endpoints (optional - for address search)
router.post("/geocode", authenticate, async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }
    const result = await geocodeAddress(address);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Geocode error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reverse geocoding (convert coordinates to address)
router.post("/reverse-geocode", authenticate, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }
    const result = await reverseGeocode(latitude, longitude);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Reverse geocode error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
