import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { API_URL } from "../../src/config/constants";

const PassengerDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [ride, setRide] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // If ride was passed via params, use it. Otherwise we could fetch by id (not implemented server-side).
    if (params?.ride) {
      try {
        const parsed = JSON.parse(params.ride);
        setRide(parsed);
      } catch (e) {
        console.warn("Failed to parse ride param", e);
      }
    }
  }, [params]);

  // Configure header title and action
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Passenger Details",
      headerTitleAlign: "center",
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 12 }}
          onPress={() => {
            const phone = ride?.passenger_id?.phone;
            if (phone) {
              Alert.alert("Call", `Call ${phone}`);
            } else {
              Alert.alert("No phone", "Passenger has no phone number");
            }
          }}
        >
          <Ionicons name="call-outline" size={22} color="#4361EE" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, ride]);

  const handleAccept = async () => {
    if (!ride) return;
    setIsProcessing(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }
      const res = await axios.post(
        `${API_URL}/riders/accept`,
        { ride_id: ride._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Alert.alert("Success", "Ride accepted");
        router.back();
      }
    } catch (error) {
      console.error("Accept error:", error.response || error.message || error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to accept ride"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!ride) return;
    setIsProcessing(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }
      const res = await axios.post(
        `${API_URL}/riders/decline`,
        { ride_id: ride._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Alert.alert("Declined", "Ride declined");
        router.back();
      }
    } catch (error) {
      console.error("Decline error:", error.response || error.message || error);
      Alert.alert("Error", "Failed to decline ride");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
          title="Pickup Location"
        />
        <Marker
          coordinate={{ latitude: 37.79825, longitude: -122.4424 }}
          title="Destination"
        />
      </MapView>

      <View style={styles.detailsContainer}>
        <View style={styles.passengerInfo}>
          <Image
            source={{
              uri:
                ride?.passenger_id?.avatar ||
                "https://randomuser.me/api/portraits/men/32.jpg",
            }}
            style={styles.avatar}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              {ride?.passenger_id?.full_name || "Passenger"}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>
                {(ride?.passenger_id?.rating || 0).toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rideDetails}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color="#2E86C1" />
            <Text style={styles.locationText}>
              {ride?.pickup_address || "Pickup location"}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="flag" size={20} color="#2E86C1" />
            <Text style={styles.locationText}>
              {ride?.dropoff_address || "Destination"}
            </Text>
          </View>
        </View>

        <View style={styles.fareContainer}>
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Distance</Text>
            <Text style={styles.fareValue}>
              {ride?.distance_km ? `${ride.distance_km.toFixed(1)} km` : "—"}
            </Text>
          </View>
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Est. Fare</Text>
            <Text style={styles.fareValue}>
              {ride?.estimated_fare
                ? `${ride.estimated_fare} ${ride.currency || "KES"}`
                : "—"}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? "Processing..." : "Accept Ride"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={handleDecline}
            disabled={isProcessing}
          >
            <Text style={[styles.buttonText, styles.rejectText]}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  detailsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  passengerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  rideDetails: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  fareContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  fareItem: {},
  fareLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  fareValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: "#2E86C1",
  },
  rejectButton: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  rejectText: {
    color: "#333",
  },
});

export default PassengerDetailsScreen;
