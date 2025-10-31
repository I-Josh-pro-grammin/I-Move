// controllers/riderController.js
import { Ride } from '../models/rideModel.js';
import { User } from '../models/userModel.js';

export const acceptRide = async (req, res) => {
  try {
    const { ride_id } = req.body;
    const riderId = req.user.id;

    if (!ride_id) {
      return res.status(400).json({
        success: false,
        message: "ride_id is required"
      });
    }

    // Find the ride and verify it belongs to this rider
    const ride = await Ride.findOne({
      _id: ride_id,
      rider_id: riderId,
      status: 'pending'
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found or already processed"
      });
    }

    // Update ride status to accepted
    await Ride.findByIdAndUpdate(ride_id, { status: 'accepted' });

    // Update rider status to busy
    await User.findByIdAndUpdate(riderId, {
      status: 'busy',
      is_available: false
    });

    const updatedRide = await Ride.findById(ride_id)
      .populate('passenger_id', 'full_name email phone rating')
      .populate('rider_id', 'full_name email phone rating vehicle_type license_plate');

    res.status(200).json({
      success: true,
      ride: updatedRide,
      message: 'Ride accepted successfully'
    });
  } catch (err) {
    console.error('Accept ride error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const declineRide = async (req, res) => {
  try {
    const { ride_id } = req.body;
    const riderId = req.user.id;

    if (!ride_id) {
      return res.status(400).json({
        success: false,
        message: "ride_id is required"
      });
    }

    // Find the ride and verify it belongs to this rider
    const ride = await Ride.findOne({
      _id: ride_id,
      rider_id: riderId,
      status: 'pending'
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found or already processed"
      });
    }

    // Update ride status to declined
    await Ride.findByIdAndUpdate(ride_id, { status: 'declined' });

    res.status(200).json({
      success: true,
      message: 'Ride declined successfully'
    });
  } catch (err) {
    console.error('Decline ride error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRideRequests = async (req, res) => {
  try {
    const riderId = req.user.id;

    const requests = await Ride.find({
      rider_id: riderId,
      status: 'pending'
    })
      .populate('passenger_id', 'full_name email phone rating latitude longitude')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get ride requests error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ride requests",
      error: error.message
    });
  }
};

export const getMyRides = async (req, res) => {
  try {
    const riderId = req.user.id;

    const rides = await Ride.find({ rider_id: riderId })
      .populate('passenger_id', 'full_name email phone rating')
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

export const completeRide = async (req, res) => {
  try {
    const { ride_id } = req.body;
    const riderId = req.user.id;

    if (!ride_id) {
      return res.status(400).json({
        success: false,
        message: "ride_id is required"
      });
    }

    // Find the ride and verify it belongs to this rider and is accepted
    const ride = await Ride.findOne({
      _id: ride_id,
      rider_id: riderId,
      status: 'accepted'
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or not in accepted status"
      });
    }

    // Update ride status to completed
    await Ride.findByIdAndUpdate(ride_id, { status: 'completed' });

    // Update rider status back to available
    await User.findByIdAndUpdate(riderId, {
      status: 'available',
      is_available: true
    });

    const updatedRide = await Ride.findById(ride_id)
      .populate('passenger_id', 'full_name email phone rating')
      .populate('rider_id', 'full_name email phone rating vehicle_type license_plate');

    res.status(200).json({
      success: true,
      ride: updatedRide,
      message: 'Ride completed successfully'
    });
  } catch (err) {
    console.error('Complete ride error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const { is_available } = req.body;
    const riderId = req.user.id;

    if (typeof is_available !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "is_available must be a boolean"
      });
    }

    const user = await User.findByIdAndUpdate(
      riderId,
      {
        is_available,
        status: is_available ? 'available' : 'busy'
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      user: userObj,
      message: "Availability updated successfully"
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
