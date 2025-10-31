import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { COLORS, MAP_INITIAL_REGION, API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

const PassengerHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyRiders, setNearbyRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Fetch nearby riders once we have location
      fetchNearbyRiders(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const fetchNearbyRiders = async (latitude, longitude) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/riders/nearby`, {
        params: { latitude, longitude }
      });
      
      const riders = response.data;
      setNearbyRiders(riders);
      
      // Announce number of riders using speech
      if (riders.length > 0) {
        Speech.speak(`${riders.length} riders nearby`);
      } else {
        Speech.speak('No riders found nearby');
      }
    } catch (error) {
      console.error('Error fetching nearby riders:', error);
      // For demo, add mock data if API fails
      const mockRiders = generateMockRiders(latitude, longitude);
      setNearbyRiders(mockRiders);
      Speech.speak(`${mockRiders.length} riders nearby`);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock riders for demo purposes
  const generateMockRiders = (latitude, longitude) => {
    const riders = [];
    for (let i = 0; i < 5; i++) {
      // Generate random coordinates within ~1km
      const lat = latitude + (Math.random() - 0.5) * 0.01;
      const lng = longitude + (Math.random() - 0.5) * 0.01;
      
      riders.push({
        id: i + 1,
        full_name: `Rider ${i + 1}`,
        vehicle_type: i % 2 === 0 ? 'motorcycle' : 'bicycle',
        rating: (3 + Math.random() * 2).toFixed(1),
        latitude: lat,
        longitude: lng,
        distance: ((Math.random() * 0.8) + 0.2).toFixed(1)
      });
    }
    return riders;
  };

  const handleRiderPress = (rider) => {
    setSelectedRider(rider);
  };

  const handleSetDestination = () => {
    navigation.navigate('Destination');
  };

  const handleRequestRide = () => {
    if (!selectedRider) {
      Alert.alert('Error', 'Please select a rider first');
      return;
    }
    
    navigation.navigate('RiderDetails', { rider: selectedRider });
  };

  const renderRiderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.riderItem,
        selectedRider?.id === item.id && styles.selectedRiderItem
      ]}
      onPress={() => handleRiderPress(item)}
    >
      <View style={styles.riderIconContainer}>
        <Ionicons
          name={item.vehicle_type === 'motorcycle' ? 'motorcycle' : 'bicycle'}
          size={24}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.riderInfo}>
        <Text style={styles.riderName}>{item.full_name}</Text>
        <Text style={styles.riderDetails}>
          {item.vehicle_type.charAt(0).toUpperCase() + item.vehicle_type.slice(1)} • {item.distance} km
        </Text>
      </View>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color={COLORS.warning} />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={location ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            } : MAP_INITIAL_REGION}
          >
            {/* User's current location */}
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="You are here"
                pinColor={COLORS.primary}
              />
            )}
            
            {/* Nearby riders */}
            {nearbyRiders.map((rider) => (
              <Marker
                key={rider.id}
                coordinate={{
                  latitude: rider.latitude,
                  longitude: rider.longitude,
                }}
                title={rider.full_name}
                description={`${rider.vehicle_type} • ${rider.rating}★`}
                pinColor={selectedRider?.id === rider.id ? COLORS.accent : COLORS.secondary}
                onPress={() => handleRiderPress(rider)}
              />
            ))}
          </MapView>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSetDestination}
            >
              <Ionicons name="location" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Set Destination</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                !selectedRider && styles.disabledButton
              ]}
              onPress={handleRequestRide}
              disabled={!selectedRider}
            >
              <Ionicons name="bicycle" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Request Ride</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.ridersListContainer}>
            <Text style={styles.ridersListTitle}>
              {isLoading ? 'Finding riders...' : `${nearbyRiders.length} Riders Nearby`}
            </Text>
            <FlatList
              data={nearbyRiders}
              renderItem={renderRiderItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ridersList}
            />
          </View>
        </>
      )}
    </View>
  );
};

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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  actionButtonText: {
    color: COLORS.white,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  ridersListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    elevation: 5,
  },
  ridersListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ridersList: {
    paddingBottom: 10,
  },
  riderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    width: 220,
  },
  selectedRiderItem: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  riderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  riderDetails: {
    color: COLORS.gray,
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 2,
    fontWeight: 'bold',
  },
});

export default PassengerHomeScreen;