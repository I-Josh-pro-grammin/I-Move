import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  API_URL,
  COLORS,
  MAP_INITIAL_REGION,
} from "../../src/config/constants";
import { useAuth } from "../../src/contexts/AuthContext";

export default function RiderHomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(user?.is_available || false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is required to use this app"
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Update location in backend (if token present)
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
        } else {
          // No token - ensure user is sent to login
          await logout();
          router.replace("/auth/login");
        }
      } catch (error) {
        console.error(
          "Error updating location:",
          error.response || error.message || error
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (isAvailable) {
      fetchRideRequests();
      // Poll for new requests every 10 seconds when available
      const interval = setInterval(fetchRideRequests, 10000);
      return () => clearInterval(interval);
    }
  }, [isAvailable]);

  const fetchRideRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        // Not authenticated
        await logout();
        router.replace("/auth/login");
        return;
      }

      const response = await axios.get(`${API_URL}/riders/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setRideRequests(response.data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching ride requests:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const newAvailability = !isAvailable;
      const response = await axios.put(
        `${API_URL}/riders/availability`,
        { is_available: newAvailability },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setIsAvailable(newAvailability);
        if (newAvailability) {
          fetchRideRequests();
        }
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      Alert.alert("Error", "Failed to update availability");
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/riders/accept`,
        { ride_id: rideId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Alert.alert("Ride Accepted", "You have accepted the ride request");
        fetchRideRequests();
      }
    } catch (error) {
      console.error("Error accepting ride:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to accept ride"
      );
    }
  };

  const handleDeclineRide = async (rideId) => {
    Alert.alert("Decline Ride", "Are you sure you want to decline this ride?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const response = await axios.post(
              `${API_URL}/riders/decline`,
              { ride_id: rideId },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (response.data.success) {
              fetchRideRequests();
            }
          } catch (error) {
            console.error("Error declining ride:", error);
            Alert.alert("Error", "Failed to decline ride");
          }
        },
      },
    ]);
  };

  const handleViewPassenger = (ride) => {
    // Pass the whole ride object to the passenger details screen so it can render immediately
    router.push({
      pathname: "/(rider)/passenger-details",
      params: { ride: JSON.stringify(ride) },
    });
  };

  const renderRideRequest = ({ item }) => {
    const passenger = item.passenger_id;
    if (!passenger) return null;

    return (
      <TouchableOpacity
        style={styles.rideRequestCard}
        onPress={() => handleViewPassenger(item)}
      >
        <View style={styles.rideRequestHeader}>
          <View style={styles.passengerInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.passengerName}>{passenger.full_name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={COLORS.warning} />
                <Text style={styles.ratingText}>
                  {passenger.rating?.toFixed(1) || "0.0"}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.fareText}>
            {item.estimated_fare?.toFixed(0) || "0"} {item.currency || "KES"}
          </Text>
        </View>

        <View style={styles.rideDetails}>
          <View style={styles.locationRow}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.pickup_address || "Pickup Location"}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, styles.destinationDot]} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.dropoff_address || "Destination"}
            </Text>
          </View>
        </View>

        <View style={styles.rideFooter}>
          <Text style={styles.distanceText}>
            {item.distance_km?.toFixed(1) || "0.0"} km
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDeclineRide(item._id)}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptRide(item._id)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : MAP_INITIAL_REGION
        }
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            pinColor={isAvailable ? COLORS.success : COLORS.gray}
          />
        )}
      </MapView>

      <View style={styles.topContainer}>
        <TouchableOpacity
          style={[
            styles.availabilityButton,
            isAvailable && styles.availableButton,
          ]}
          onPress={handleToggleAvailability}
        >
          <Ionicons
            name={isAvailable ? "radio-button-on" : "radio-button-off"}
            size={20}
            color={isAvailable ? COLORS.white : COLORS.gray}
          />
          <Text
            style={[
              styles.availabilityText,
              isAvailable && styles.availableText,
            ]}
          >
            {isAvailable ? "Online" : "Go Online"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.bottomHeader}>
          <Text style={styles.bottomTitle}>
            {isAvailable ? "Ride Requests" : "Go online to receive requests"}
          </Text>
          {isAvailable && (
            <TouchableOpacity
              onPress={() => {
                setRefreshing(true);
                fetchRideRequests();
              }}
            >
              <Ionicons name="refresh" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.loader}
          />
        ) : isAvailable ? (
          rideRequests.length > 0 ? (
            <FlatList
              data={rideRequests}
              renderItem={renderRideRequest}
              keyExtractor={(item) =>
                item._id?.toString() || Math.random().toString()
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={fetchRideRequests}
                />
              }
              contentContainerStyle={styles.ridesList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-outline"
                size={60}
                color={COLORS.lightGray}
              />
              <Text style={styles.emptyText}>No ride requests</Text>
              <Text style={styles.emptySubtext}>
                You'll receive requests here when passengers need a ride
              </Text>
            </View>
          )
        ) : (
          <Text style={styles.offlineText}>
            Tap "Go Online" to start receiving ride requests
          </Text>
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
  topContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
  },
  availabilityButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    alignSelf: "flex-start",
  },
  availableButton: {
    backgroundColor: COLORS.success,
  },
  availabilityText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.gray,
  },
  availableText: {
    color: COLORS.white,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    maxHeight: "60%",
    elevation: 5,
  },
  bottomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  bottomTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    padding: 20,
  },
  ridesList: {
    paddingBottom: 10,
  },
  rideRequestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  rideRequestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  passengerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.gray,
  },
  fareText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  rideDetails: {
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  destinationDot: {
    backgroundColor: COLORS.accent,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray,
  },
  rideFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  distanceText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  declineButton: {
    backgroundColor: COLORS.lightGray,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  declineButtonText: {
    color: COLORS.dark,
    fontWeight: "bold",
  },
  acceptButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
  },
  offlineText: {
    textAlign: "center",
    color: COLORS.gray,
    padding: 20,
    fontSize: 16,
  },
});
