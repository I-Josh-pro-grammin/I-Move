import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  COLORS,
  API_URL,
  MAP_INITIAL_REGION,
} from "../../src/config/constants";

export default function DestinationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchText, setSearchText] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Initialize map with user's current location or pickup location
    let isMounted = true;

    (async () => {
      try {
        let location;
        const pickupLat = params.pickupLat;
        const pickupLng = params.pickupLng;

        if (pickupLat && pickupLng) {
          location = {
            latitude: parseFloat(pickupLat),
            longitude: parseFloat(pickupLng),
          };
        } else {
          // Request location permission first
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const position = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
          } else {
            // Fallback to Rwanda (Kigali) if permission denied
            location = {
              latitude: MAP_INITIAL_REGION.latitude,
              longitude: MAP_INITIAL_REGION.longitude,
            };
          }
        }

        if (isMounted) {
          setMapRegion({
            ...location,
            latitudeDelta: MAP_INITIAL_REGION.latitudeDelta,
            longitudeDelta: MAP_INITIAL_REGION.longitudeDelta,
          });
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        // Fallback to Rwanda default
        if (isMounted) {
          setMapRegion(MAP_INITIAL_REGION);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []); // Run only once on mount

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert("Empty Search", "Please enter an address to search");
      return;
    }

    setIsSearching(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/passengers/geocode`,
        { address: searchText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const location = {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
        };
        setSelectedLocation(location);
        setMapRegion({
          ...location,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        Alert.alert(
          "Not Found",
          response.data.message ||
            "Address not found. Please try selecting on the map instead."
        );
      }
    } catch (error) {
      console.error("Geocoding error:", error);

      // Don't show alert for 500 errors if service is unavailable
      // Just silently fail and let user use map
      if (error.response?.status === 500 || error.response?.status === 503) {
        // Service unavailable - just use map selection
        setIsSearching(false);
        return;
      }

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Address search unavailable. Please tap on the map to select your destination.";

      Alert.alert("Search Unavailable", errorMessage, [
        {
          text: "OK",
          onPress: () => {
            // Clear search and let user use map
            setIsSearching(false);
          },
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapPress = (event) => {
    const location = event.nativeEvent.coordinate;
    setSelectedLocation(location);
  };

  const handleConfirmDestination = () => {
    if (!selectedLocation) {
      Alert.alert(
        "Error",
        "Please select a destination by searching or tapping on the map"
      );
      return;
    }

    // Pass destination back to passenger home
    router.back();
    // Store destination temporarily - in production, use proper state management
    AsyncStorage.setItem(
      "selectedDestination",
      JSON.stringify(selectedLocation)
    );
  };

  const recentLocations = [
    { name: "Home", address: "123 Main Street" },
    { name: "Work", address: "456 Office Building" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Destination</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={COLORS.gray}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search destination (optional - tap map to select)"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          onPress={handleSearch}
          disabled={isSearching || !searchText.trim()}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons
              name="arrow-forward"
              size={20}
              color={searchText.trim() ? COLORS.primary : COLORS.lightGray}
            />
          )}
        </TouchableOpacity>
      </View>

      {mapRegion && (
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={false}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Destination"
              pinColor={COLORS.primary}
            />
          )}
        </MapView>
      )}

      <View style={styles.bottomContainer}>
        {selectedLocation ? (
          <>
            <View style={styles.selectedLocationInfo}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={COLORS.success}
              />
              <Text style={styles.selectedLocationText}>Location selected</Text>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmDestination}
            >
              <Text style={styles.confirmButtonText}>Confirm Destination</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.instructionText}>
              Tap on the map to select your destination, or search for an
              address above
            </Text>
            <Text style={styles.sectionTitle}>Quick Suggestions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentLocations.map((location, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.locationChip}
                  onPress={() => setSearchText(location.address)}
                >
                  <Ionicons name="location" size={16} color={COLORS.primary} />
                  <Text style={styles.locationChipText}>{location.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    paddingHorizontal: 15,
    backgroundColor: COLORS.light,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
  },
  map: {
    flex: 1,
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
    maxHeight: 250,
    elevation: 5,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 15,
    fontStyle: "italic",
  },
  selectedLocationInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    padding: 10,
    backgroundColor: COLORS.light,
    borderRadius: 8,
  },
  selectedLocationText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.dark,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  locationChipText: {
    marginLeft: 5,
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
