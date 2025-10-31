import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PassengerHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Passenger Home Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PassengerHomeScreen;