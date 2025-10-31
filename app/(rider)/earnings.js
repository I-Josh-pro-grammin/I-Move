import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EarningsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  
  const earningsData = {
    day: { total: 85.50, trips: 5 },
    week: { total: 450.75, trips: 28 },
    month: { total: 1850.25, trips: 112 }
  };

  const trips = [
    { id: '1', date: 'Today, 2:30 PM', passenger: 'John Smith', pickup: 'Downtown', destination: 'Airport', amount: 24.50 },
    { id: '2', date: 'Today, 12:15 PM', passenger: 'Sarah Johnson', pickup: 'Mall', destination: 'University', amount: 18.75 },
    { id: '3', date: 'Today, 10:00 AM', passenger: 'Michael Brown', pickup: 'Hotel', destination: 'Convention Center', amount: 15.25 },
    { id: '4', date: 'Yesterday, 7:45 PM', passenger: 'Emily Davis', pickup: 'Restaurant', destination: 'Residential Area', amount: 12.80 },
    { id: '5', date: 'Yesterday, 5:30 PM', passenger: 'David Wilson', pickup: 'Office Park', destination: 'Shopping Center', amount: 14.20 },
  ];

  const renderTripItem = ({ item }) => (
    <View style={styles.tripItem}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>{item.date}</Text>
        <Text style={styles.tripAmount}>${item.amount.toFixed(2)}</Text>
      </View>
      <Text style={styles.passengerName}>{item.passenger}</Text>
      <View style={styles.tripRoute}>
        <Text style={styles.routeText}>{item.pickup} → {item.destination}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'day' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('day')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'day' && styles.selectedPeriodText]}>Day</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'week' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'week' && styles.selectedPeriodText]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'month' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'month' && styles.selectedPeriodText]}>Month</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.totalEarnings}>${earningsData[selectedPeriod].total.toFixed(2)}</Text>
        <Text style={styles.tripsCompleted}>{earningsData[selectedPeriod].trips} trips completed</Text>
      </View>
      
      <View style={styles.recentTripsHeader}>
        <Text style={styles.recentTripsTitle}>Recent Trips</Text>
      </View>
      
      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.tripsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  summaryCard: {
    backgroundColor: '#2E86C1',
    padding: 20,
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    marginBottom: 20,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  selectedPeriod: {
    backgroundColor: 'white',
  },
  periodText: {
    color: 'white',
    fontWeight: '500',
  },
  selectedPeriodText: {
    color: '#2E86C1',
  },
  totalEarnings: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  tripsCompleted: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  recentTripsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  recentTripsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tripsList: {
    paddingBottom: 20,
  },
  tripItem: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  tripDate: {
    color: '#666',
    fontSize: 14,
  },
  tripAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  passengerName: {
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 5,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeText: {
    color: '#666',
    fontSize: 14,
  },
});

export default EarningsScreen;