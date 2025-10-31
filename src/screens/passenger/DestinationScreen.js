import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

const DestinationScreen = ({ navigation }) => {
  const [destination, setDestination] = useState('');
  const [recentLocations] = useState([
    { id: 1, name: 'Home', address: '123 Main Street, City' },
    { id: 2, name: 'Work', address: '456 Office Building, Business District' },
    { id: 3, name: 'Gym', address: 'Fitness Center, Health Avenue' },
    { id: 4, name: 'Mall', address: 'Shopping Center, Retail Road' },
  ]);

  const handleSelectDestination = (location) => {
    // In a real app, we would store the selected destination
    // and pass coordinates to the map
    navigation.goBack();
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
        <Text style={styles.headerTitle}>Set Destination</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Where to?"
          value={destination}
          onChangeText={setDestination}
        />
      </View>

      <ScrollView style={styles.locationsContainer}>
        <Text style={styles.sectionTitle}>Recent Locations</Text>
        
        {recentLocations.map((location) => (
          <TouchableOpacity
            key={location.id}
            style={styles.locationItem}
            onPress={() => handleSelectDestination(location)}
          >
            <View style={styles.locationIconContainer}>
              <Ionicons name="location" size={20} color={COLORS.white} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationAddress}>{location.address}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Suggestions</Text>
        
        <TouchableOpacity
          style={styles.locationItem}
          onPress={() => handleSelectDestination({ name: 'City Center', address: 'Downtown, Main Square' })}
        >
          <View style={styles.locationIconContainer}>
            <Ionicons name="business" size={20} color={COLORS.white} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>City Center</Text>
            <Text style={styles.locationAddress}>Downtown, Main Square</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.locationItem}
          onPress={() => handleSelectDestination({ name: 'Airport', address: 'International Airport, Terminal 1' })}
        >
          <View style={styles.locationIconContainer}>
            <Ionicons name="airplane" size={20} color={COLORS.white} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>Airport</Text>
            <Text style={styles.locationAddress}>International Airport, Terminal 1</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  locationsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
});

export default DestinationScreen;