import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, API_URL } from '../../src/config/constants';

export default function RidesScreen() {
  const [activeTab, setActiveTab] = useState('past');
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/passengers/rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setRides(response.data.rides || []);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'accepted':
        return COLORS.primary;
      case 'pending':
        return COLORS.warning;
      case 'declined':
      case 'cancelled':
        return COLORS.danger;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  };

  const filteredRides = React.useMemo(() => {
    if (activeTab === 'upcoming') {
      return rides.filter(
        (ride) => ride.status === 'pending' || ride.status === 'accepted'
      );
    } else {
      return rides.filter(
        (ride) =>
          ride.status === 'completed' ||
          ride.status === 'declined' ||
          ride.status === 'cancelled'
      );
    }
  }, [rides, activeTab]);

  const renderRideItem = ({ item }) => {
    const rider = item.rider_id;
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity style={styles.rideItem}>
        <View style={styles.rideHeader}>
          <Text style={styles.rideDate}>
            {new Date(item.createdAt).toLocaleDateString()} •{' '}
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(item.status)}
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
              <Text style={styles.addressText} numberOfLines={1}>
                {item.pickup_address || 'Pickup Location'}
              </Text>

              <Text style={[styles.addressLabel, styles.destinationLabel]}>Destination</Text>
              <Text style={styles.addressText} numberOfLines={1}>
                {item.dropoff_address || 'Destination'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rideFooter}>
          <View style={styles.riderInfo}>
            <Ionicons name="person" size={16} color={COLORS.gray} />
            <Text style={styles.riderName}>
              {rider?.full_name || 'Rider'}
            </Text>
            {rider?.rating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={COLORS.warning} />
                <Text style={styles.ratingText}>{rider.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.ridePrice}>
              {item.estimated_fare?.toFixed(0) || '0'} {item.currency || 'KES'}
            </Text>
            <Text style={styles.distanceText}>
              {item.distance_km?.toFixed(1) || '0.0'} km
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text
            style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}
          >
            Past
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : filteredRides.length > 0 ? (
        <FlatList
          data={filteredRides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.ridesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchRides} />
          }
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
  loader: {
    padding: 40,
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
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  ratingText: {
    marginLeft: 2,
    fontSize: 12,
    color: COLORS.gray,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  ridePrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
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
