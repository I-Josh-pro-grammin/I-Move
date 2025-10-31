import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';

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
  gray: '#6C757D',
  lightGray: '#E9ECEF',
};

export default function RiderProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <View style={styles.profileSection}>
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={40} color={COLORS.white} />
        </View>
        <Text style={styles.profileName}>{user?.full_name || 'Rider'}</Text>
        <Text style={styles.profileRole}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Rider'}</Text>
      </View>
      
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Ionicons name="mail" size={20} color={COLORS.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>{user?.email || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="call" size={20} color={COLORS.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>{user?.phone || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="bicycle" size={20} color={COLORS.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            {user?.vehicle_type?.charAt(0).toUpperCase() + user?.vehicle_type?.slice(1) || 'N/A'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="star" size={20} color={COLORS.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>Rating: {user?.rating?.toFixed(1) || '0.0'}</Text>
        </View>
        {user?.license_plate && (
          <View style={styles.infoItem}>
            <Ionicons name="card" size={20} color={COLORS.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>License: {user.license_plate}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="settings-outline" size={24} color={COLORS.dark} style={styles.actionIcon} />
          <Text style={styles.actionText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="wallet-outline" size={24} color={COLORS.dark} style={styles.actionIcon} />
          <Text style={styles.actionText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.dark} style={styles.actionIcon} />
          <Text style={styles.actionText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.dark} style={styles.actionIcon} />
          <Text style={styles.actionText}>About</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.white,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 16,
    color: COLORS.gray,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.dark,
  },
  actionsSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    color: COLORS.dark,
    flex: 1,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 30,
    backgroundColor: COLORS.danger,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});