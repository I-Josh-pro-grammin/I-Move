import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../config/constants';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'passenger',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register, login } = useAuth();

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      
      await register(userData);
      Alert.alert('Success', 'Registration successful! Please log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Create Account</Text>
        <Text style={styles.subHeaderText}>Join IMove today</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.full_name}
          onChangeText={(value) => handleChange('full_name', value)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.phone}
          onChangeText={(value) => handleChange('phone', value)}
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          secureTextEntry
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          secureTextEntry
        />

        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>I want to:</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'passenger' && styles.roleButtonActive,
              ]}
              onPress={() => handleChange('role', 'passenger')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  formData.role === 'passenger' && styles.roleButtonTextActive,
                ]}
              >
                Book Rides
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'rider' && styles.roleButtonActive,
              ]}
              onPress={() => handleChange('role', 'rider')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  formData.role === 'rider' && styles.roleButtonTextActive,
                ]}
              >
                Offer Rides
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.registerButtonText}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  headerContainer: {
    marginTop: 60,
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  subHeaderText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: COLORS.light,
  },
  roleContainer: {
    marginVertical: 15,
  },
  roleLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: COLORS.dark,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    color: COLORS.gray,
  },
  roleButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginText: {
    color: COLORS.gray,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;