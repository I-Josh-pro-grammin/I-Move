import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const PassengerDetailsScreen = () => {
  const router = useRouter();

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
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.avatar}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>John Doe</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>4.8</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.rideDetails}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color="#2E86C1" />
            <Text style={styles.locationText}>123 Main St, San Francisco</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="flag" size={20} color="#2E86C1" />
            <Text style={styles.locationText}>456 Market St, San Francisco</Text>
          </View>
        </View>
        
        <View style={styles.fareContainer}>
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Distance</Text>
            <Text style={styles.fareValue}>2.5 miles</Text>
          </View>
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Est. Fare</Text>
            <Text style={styles.fareValue}>$12.50</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.acceptButton]}>
            <Text style={styles.buttonText}>Accept Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.rejectButton]}>
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  rideDetails: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  fareItem: {},
  fareLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  fareValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#2E86C1',
  },
  rejectButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rejectText: {
    color: '#333',
  },
});

export default PassengerDetailsScreen;