import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  COLORS,
  API_URL,
  MAP_INITIAL_REGION,
} from "../../src/config/constants";

export default function PassengerHomeScreen() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyRiders, setNearbyRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg(
            "Permission to access location was denied. Please enable location in settings."
          );
          setIsLoading(false);
          // Still try to fetch riders with default location (Rwanda)
          fetchNearbyRiders(-1.9403, 30.0619);
          return;
        }

        // Request high accuracy location
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation(location);
        setPickupLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Animate map to user location
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              },
              1000
            );
          }
        }, 100);

        // Update location in backend
        try {
          const token = await AsyncStorage.getItem("token");
          if (token) {
            await axios.put(
              `${API_URL}/auth/location`,
              {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          }
        } catch (error) {
          console.error("Error updating location:", error);
          // Don't block the app if location update fails
        }

        // Fetch nearby riders
        fetchNearbyRiders(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error("Location error:", error);
        setErrorMsg("Unable to get your location. Showing default area.");
        setIsLoading(false);
        // Use Rwanda default location
        fetchNearbyRiders(-1.9403, 30.0619);
      }
    })();
  }, []);

  // Check for selected destination when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const checkDestination = async () => {
        try {
          const destinationJson = await AsyncStorage.getItem(
            "selectedDestination"
          );
          if (destinationJson) {
            const destination = JSON.parse(destinationJson);
            setDestinationLocation(destination);
            await AsyncStorage.removeItem("selectedDestination"); // Clear after reading
          }
        } catch (error) {
          console.error("Error reading destination:", error);
        }
      };
      checkDestination();
    }, [])
  );

  // Recalculate fare when destination and rider are both set
  useEffect(() => {
    if (selectedRider && destinationLocation && pickupLocation) {
      calculateFare();
    }
  }, [selectedRider, destinationLocation, pickupLocation, calculateFare]);

  const fetchNearbyRiders = async (latitude, longitude) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${API_URL}/passengers/nearby-riders`, {
        params: { latitude, longitude, maxDistanceKm: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setNearbyRiders(response.data.riders || []);
      }
    } catch (error) {
      console.error("Error fetching nearby riders:", error);
      Alert.alert("Error", "Failed to fetch nearby riders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDestination = () => {
    router.push({
      pathname: "/(passenger)/destination",
      params: {
        pickupLat: pickupLocation?.latitude,
        pickupLng: pickupLocation?.longitude,
      },
    });
  };

  const handleSelectRider = (rider) => {
    setSelectedRider(rider);
    if (pickupLocation && destinationLocation) {
      calculateFare();
    }
  };

  const calculateFare = useCallback(async () => {
    if (!pickupLocation || !destinationLocation) return;

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/passengers/fare-estimate`,
        {
          pickup_lat: pickupLocation.latitude,
          pickup_lng: pickupLocation.longitude,
          dropoff_lat: destinationLocation.latitude,
          dropoff_lng: destinationLocation.longitude,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setFareEstimate(response.data);
      }
    } catch (error) {
      console.error("Error calculating fare:", error);
    }
  }, [pickupLocation, destinationLocation]);

  const handleRequestRide = async () => {
    if (!selectedRider) {
      Alert.alert("Error", "Please select a rider first");
      return;
    }

    if (!pickupLocation || !destinationLocation) {
      Alert.alert("Error", "Please set both pickup and destination locations");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/passengers/ride`,
        {
          rider_id: selectedRider._id,
          pickup_lat: pickupLocation.latitude,
          pickup_lng: pickupLocation.longitude,
          dropoff_lat: destinationLocation.latitude,
          dropoff_lng: destinationLocation.longitude,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Alert.alert(
          "Ride Requested",
          "Your ride request has been sent. Waiting for rider response...",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to ride status screen or refresh
                router.push("/(passenger)/rides");
              },
            },
          ]
        );
        // Reset selection
        setSelectedRider(null);
        setDestinationLocation(null);
        setFareEstimate(null);
      }
    } catch (error) {
      console.error("Error requesting ride:", error);
      Alert.alert(
        "Request Failed",
        error.response?.data?.message ||
          "Unable to request ride. Please try again."
      );
    }
  };

  const renderRiderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.riderItem,
        selectedRider?._id === item._id && styles.selectedRiderItem,
      ]}
      onPress={() => handleSelectRider(item)}
    >
      <View style={styles.riderIconContainer}>
        <Ionicons
          name={item.vehicle_type === "motorcycle" ? "bicycle" : "bicycle"}
          size={24}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.riderInfo}>
        <Text style={styles.riderName}>{item.full_name}</Text>
        <Text style={styles.riderDetails}>
          {item.vehicle_type?.charAt(0).toUpperCase() +
            item.vehicle_type?.slice(1) || "Vehicle"}{" "}
          • {item.distance_km?.toFixed(1) || "0.0"} km
        </Text>
      </View>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color={COLORS.warning} />
        <Text style={styles.ratingText}>
          {item.rating?.toFixed(1) || "0.0"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={MAP_INITIAL_REGION}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={false}
      >
        {/* User's current location marker - using showsUserLocation prop handles this */}
        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Your Location"
            description="Pickup point"
            pinColor={COLORS.success}
          />
        )}

        {/* Selected destination marker */}
        {destinationLocation && (
          <Marker
            coordinate={destinationLocation}
            title="Destination"
            description="Drop-off point"
            pinColor={COLORS.accent}
          />
        )}

        {nearbyRiders.map((rider) => (
          <Marker
            key={rider._id}
            coordinate={{
              latitude: rider.location?.latitude || rider.latitude,
              longitude: rider.location?.longitude || rider.longitude,
            }}
            title={rider.full_name}
            description={`${rider.vehicle_type} • ${rider.rating}★`}
            pinColor={
              selectedRider?._id === rider._id
                ? COLORS.accent
                : COLORS.secondary
            }
            onPress={() => handleSelectRider(rider)}
          />
        ))}
      </MapView>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSetDestination}
        >
          <Ionicons name="location" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>
            {destinationLocation ? "Change Destination" : "Set Destination"}
          </Text>
        </TouchableOpacity>

        {fareEstimate && (
          <View style={styles.fareContainer}>
            <Text style={styles.fareText}>
              {fareEstimate.currency || "KES"}{" "}
              {fareEstimate.estimated_fare?.toFixed(0)}
            </Text>
            <Text style={styles.distanceText}>
              {fareEstimate.distance_km?.toFixed(1)} km
            </Text>
          </View>
        )}
      </View>

      <View style={styles.ridersListContainer}>
        <View style={styles.ridersListHeader}>
          <Text style={styles.ridersListTitle}>
            {isLoading
              ? "Finding riders..."
              : `${nearbyRiders.length} Riders Nearby`}
          </Text>
          <TouchableOpacity
            onPress={() =>
              fetchNearbyRiders(
                location.coords.latitude,
                location.coords.longitude
              )
            }
          >
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : nearbyRiders.length === 0 ? (
          <Text style={styles.noRidersText}>No riders available nearby</Text>
        ) : (
          <FlatList
            data={nearbyRiders}
            renderItem={renderRiderItem}
            keyExtractor={(item) =>
              item._id?.toString() || Math.random().toString()
            }
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ridersList}
          />
        )}

        {selectedRider && (
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestRide}
          >
            <Text style={styles.requestButtonText}>
              Request Ride from {selectedRider.full_name}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: "center",
  },
  actionButtonsContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 3,
  },
  actionButtonText: {
    color: COLORS.white,
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 14,
  },
  fareContainer: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  fareText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  ridersListContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    maxHeight: 300,
    elevation: 5,
  },
  ridersListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ridersListTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ridersList: {
    paddingBottom: 10,
  },
  riderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    width: 220,
  },
  selectedRiderItem: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.light + "80",
  },
  riderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  riderDetails: {
    color: COLORS.gray,
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 2,
    fontWeight: "bold",
  },
  noRidersText: {
    textAlign: "center",
    color: COLORS.gray,
    padding: 20,
  },
  requestButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  requestButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
