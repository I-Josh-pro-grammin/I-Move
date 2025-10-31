import { Ride } from "../models/rideModel.js";
import { User } from "../models/userModel.js";
import { calculateDistance, calculateFare } from "../utils/haversine.js";

export const requestRide = async (req, res) => {
  try {
    const passengerId = req.user.id;
    const { rider_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, pickup_address, dropoff_address } = req.body;

    if (!rider_id || !pickup_lat || !pickup_lng || !dropoff_lat || !dropoff_lng) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: rider_id, pickup coordinates, and dropoff coordinates"
      });
    }

    // Check if rider exists and is available
    const rider = await User.findById(rider_id);
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found"
      });
    }

    if (rider.role !== 'rider') {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a rider"
      });
    }

    if (rider.status === "busy" || !rider.is_available) {
      return res.status(400).json({
        success: false,
        message: "Sorry, that rider is unavailable"
      });
    }

    // Calculate distance and fare
    const distance_km = calculateDistance(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng);
    const estimated_fare = calculateFare(distance_km);

    const ride = await Ride.create({
      passenger_id: passengerId,
      rider_id,
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng,
      distance_km,
      estimated_fare,
      pickup_address: pickup_address || '',
      dropoff_address: dropoff_address || '',
      status: 'pending',
    });

    const rideObj = await Ride.findById(ride._id)
      .populate('passenger_id', 'full_name email phone rating')
      .populate('rider_id', 'full_name email phone rating vehicle_type license_plate');

    res.status(201).json({
      success: true,
      ride: rideObj,
      message: "Ride requested successfully"
    });
  } catch (err) {
    console.error('Request ride error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMyRides = async (req, res) => {
  try {
    const passengerId = req.user.id;

    const rides = await Ride.find({ passenger_id: passengerId })
      .populate('rider_id', 'full_name email phone rating vehicle_type license_plate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      rides
    });
  } catch (err) {
    console.error('Get rides error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRideStatus = async (req, res) => {
  try {
    const { rideId } = req.params;
    const passengerId = req.user.id;

    const ride = await Ride.findOne({
      _id: rideId,
      passenger_id: passengerId
    })
      .populate('rider_id', 'full_name email phone rating vehicle_type license_plate');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    res.status(200).json({
      success: true,
      ride
    });
  } catch (err) {
    console.error('Get ride status error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
