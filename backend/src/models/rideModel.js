// models/rideModel.js
import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    passenger_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickup_lat: {
      type: Number,
      required: true,
    },
    pickup_lng: {
      type: Number,
      required: true,
    },
    dropoff_lat: {
      type: Number,
      required: true,
    },
    dropoff_lng: {
      type: Number,
      required: true,
    },
    distance_km: {
      type: Number,
      default: 0,
    },
    estimated_fare: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed", "cancelled"],
      default: "pending",
    },
    pickup_address: {
      type: String,
      default: "",
    },
    dropoff_address: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Ride = mongoose.model("Ride", rideSchema);

export { Ride };
