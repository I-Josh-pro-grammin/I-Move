import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { COLORS, API_URL } from '../../config/constants';

const RiderDetailsScreen = ({ route, navigation }) => {
  const { rider } = route.params;
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestRide = async () => {
    try {
      setIsRequesting(true);
      
      // In a real app, we would send the request to the backend
      // const response = await axios.post(`${API_URL}/rides/request`, {
      //   riderId: rider.id,
      //   // Include other ride details like destination
      // });
      
      // For demo purposes, simulate a successful request
      setTimeout(() => {
        Alert.alert(
          'Ride Requested',
          `Your ride request has been sent to ${rider.full_name}. Please wait for confirmation.`,
          [
            { text: 'OK', onPress: () => navigation.navigate('PassengerTabs') }
          ]
        );
        setIsRequesting(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error requesting ride:', error);
      Alert.alert('Request Failed', 'Unable to request ride. Please try again.');
      setIsRequesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rider Details</Text>
      </View>

      <View style={styles.riderInfoContainer}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Ionicons name="person" size={60} color={COLORS.lightGray} />
          </View>
        </View>
        
        <Text style={styles.riderName}>{rider.full_name}</Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={18} color={COLORS.warning} />
          <Text style={styles.ratingText}>{rider.rating}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons 
              name={rider.vehicle_type === 'motorcycle' ? 'motorcycle' : 'bicycle'} 
              size={24} 
              color={COLORS.primary} 
            />
            <Text style={styles.infoText}>
              {rider.vehicle_type.charAt(0).toUpperCase() + rider.vehicle_type.slice(1)}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="location" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>{rider.distance} km away</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons name="call" size={24} color={COLORS.primary} />
          <Text style={styles.detailText}>+1 (555) 123-4567</Text>
        </View>
        
        {rider.vehicle_type === 'motorcycle' && (
          <View style={styles.detailItem}>
            <Ionicons name="card" size={24} color={COLORS.primary} />
            <Text style={styles.detailText}>License: ABC123</Text>
          </View>
        )}
        
        <View style={styles.detailItem}>
          <Ionicons name="time" size={24} color={COLORS.primary} />
          <Text style={styles.detailText}>Estimated arrival: 5 mins</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleRequestRide}
          disabled={isRequesting}
        >
          <Text style={styles.requestButtonText}>
            {isRequesting ? 'Sending Request...' : 'Request Ride'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
    marginLeft: 15,
  },
  riderInfoContainer: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  infoItem: {
    alignItems: 'center',
    padding: 10,
  },
  infoText: {
    marginTop: 5,
    color: COLORS.gray,
  },
  detailsContainer: {
    padding: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailText: {
    marginLeft: 15,
    fontSize: 16,
  },
  actionContainer: {
    padding: 20,
    marginTop: 'auto',
  },
  requestButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RiderDetailsScreen;