import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#4361EE',
  secondary: '#3F37C9',
  accent: '#4895EF',
  success: '#4CC9F0',
  warning: '#F72585',
  danger: '#F94144',
  dark: '#212529',
  light: '#F8F9FA',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6C757D',
  lightGray: '#E9ECEF',
};

// Mock data for ride history
const MOCK_RIDES = [
  {
    id: '1',
    date: '2023-06-15',
    time: '14:30',
    pickup: '123 Main St',
    destination: '456 Oak Ave',
    rider: 'John Doe',
    price: 12.50,
    status: 'completed',
  },
  {
    id: '2',
    date: '2023-06-10',
    time: '09:15',
    pickup: '789 Pine Rd',
    destination: '101 Maple Dr',
    rider: 'Jane Smith',
    price: 8.75,
    status: 'completed',
  },
  {
    id: '3',
    date: '2023-06-05',
    time: '18:45',
    pickup: '202 Cedar Ln',
    destination: '303 Birch St',
    rider: 'Mike Johnson',
    price: 15.20,
    status: 'completed',
  },
  {
    id: '4',
    date: '2023-06-01',
    time: '11:00',
    pickup: '404 Elm Ct',
    destination: '505 Walnut Ave',
    rider: 'Sarah Williams',
    price: 10.30,
    status: 'cancelled',
  },
];

export default function RidesScreen() {
  const [activeTab, setActiveTab] = React.useState('past');
  
  const filteredRides = React.useMemo(() => {
    if (activeTab === 'upcoming') {
      // In a real app, we would filter for upcoming rides
      return [];
    } else {
      return MOCK_RIDES;
    }
  }, [activeTab]);

  const renderRideItem = ({ item }) => (
    <TouchableOpacity style={styles.rideItem}>
      <View style={styles.rideHeader}>
        <Text style={styles.rideDate}>{item.date} • {item.time}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'completed' ? styles.completedBadge : styles.cancelledBadge
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'completed' ? 'Completed' : 'Cancelled'}
          </Text>
        </View>
      </View>
      
      <View style={styles.rideDetails}>
        <View style={styles.locationContainer}>
          <View style={styles.locationDot} />
          <View style={styles.locationLine} />
          <View style={[styles.locationDot, styles.destinationDot]} />
          
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Pickup</Text>
            <Text style={styles.addressText}>{item.pickup}</Text>
            
            <Text style={[styles.addressLabel, styles.destinationLabel]}>Destination</Text>
            <Text style={styles.addressText}>{item.destination}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.rideFooter}>
        <View style={styles.riderInfo}>
          <Ionicons name="person" size={16} color={COLORS.gray} />
          <Text style={styles.riderName}>{item.rider}</Text>
        </View>
        
        <Text style={styles.ridePrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Rides</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
      </View>
      
      {filteredRides.length > 0 ? (
        <FlatList
          data={filteredRides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ridesList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No {activeTab} rides</Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'upcoming' 
              ? 'Your upcoming rides will appear here'
              : 'Your ride history will appear here'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 60,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  ridesList: {
    padding: 15,
  },
  rideItem: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rideDate: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: COLORS.success + '20',
  },
  cancelledBadge: {
    backgroundColor: COLORS.danger + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  rideDetails: {
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  locationLine: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.primary,
    marginLeft: 5,
    position: 'absolute',
    top: 15,
    left: 0,
  },
  destinationDot: {
    backgroundColor: COLORS.accent,
    marginTop: 45,
  },
  addressContainer: {
    flex: 1,
    marginLeft: 15,
  },
  addressLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 15,
  },
  destinationLabel: {
    marginTop: 5,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderName: {
    marginLeft: 5,
    fontSize: 14,
    color: COLORS.gray,
  },
  ridePrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
});