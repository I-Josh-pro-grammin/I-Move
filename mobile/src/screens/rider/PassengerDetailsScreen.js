import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

const PassengerDetailsScreen = ({ route, navigation }) => {
  const { request } = route.params;
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptRequest = () => {
    setIsAccepting(true);
    
    // Simulate API call
    setTimeout(() => {
      Alert.alert(
        'Ride Accepted',
        `You have accepted the ride request from ${request.passenger.full_name}.`,
        [
          { text: 'OK', onPress: () => navigation.navigate('RiderTabs') }
        ]
      );
      setIsAccepting(false);
    }, 1500);
  };

  const handleRejectRequest = () => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this ride request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => {
            // In a real app, we would send the rejection to the backend
            navigation.goBack();
          }
        }
      ]
    );
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
        <Text style={styles.headerTitle}>Passenger Details</Text>
      </View>

      <View style={styles.passengerInfoContainer}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Ionicons name="person" size={60} color={COLORS.lightGray} />
          </View>
        </View>
        
        <Text style={styles.passengerName}>{request.passenger.full_name}</Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={18} color={COLORS.warning} />
          <Text style={styles.ratingText}>{request.passenger.rating}</Text>
        </View>
      </View>

      <View style={styles.rideDetailsContainer}>
        <Text style={styles.sectionTitle}>Ride Details</Text>
        
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View style={styles.originDot} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeText}>{request.pickup}</Text>
            </View>
          </View>
          
          <View style={styles.routeDivider} />
          
          <View style={styles.routePoint}>
            <View style={styles.destinationDot} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>Destination</Text>
              <Text style={styles.routeText}>{request.destination}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.fareContainer}>
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Distance</Text>
            <Text style={styles.fareValue}>{request.distance} km</Text>
          </View>
          
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Estimated Fare</Text>
            <Text style={styles.fareValue}>${request.estimatedFare.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={handleRejectRequest}
          disabled={isAccepting}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAcceptRequest}
          disabled={isAccepting}
        >
          <Text style={styles.acceptButtonText}>
            {isAccepting ? 'Accepting...' : 'Accept'}
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
  passengerInfoContainer: {
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
  passengerName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rideDetailsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  routeContainer: {
    marginBottom: 20,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginRight: 10,
    marginTop: 5,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    marginRight: 10,
    marginTop: 5,
  },
  routeDivider: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.lightGray,
    marginLeft: 5,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 15,
  },
  fareItem: {
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 5,
  },
  fareValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    marginTop: 'auto',
  },
  rejectButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rejectButtonText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: COLORS.success,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PassengerDetailsScreen;