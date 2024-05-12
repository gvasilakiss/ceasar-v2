import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import swal from 'sweetalert';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [tokenExpiration, setTokenExpiration] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken); // Store token in state for display

        if (!storedToken) {
          swal('Please log in', { icon: 'warning' });
          navigation.navigate('Login');
          return;
        }

        const response = await axios.post('http://localhost:3000/validate', { token: storedToken });
        const { valid, user, expiresAt } = response.data;

        console.log('User:', user);
        console.log('Token expiration:', new Date(expiresAt));
        console.log('Token valid:', valid);
        console.log('Token:', storedToken);
        console.log('Response:', response.data);

        if (!valid) {
          swal('Token expired', 'Your session has expired. Please log in again.', 'error')
            .then(() => {
              AsyncStorage.removeItem('token');
              navigation.navigate('Login');
            });
        } else {
          setUser(user);
          setTokenExpiration(new Date(expiresAt));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        swal('Failed to fetch user data. Please log in again.', { icon: 'error' });
        await AsyncStorage.removeItem('token');
        navigation.navigate('Login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Update timer every second
    const timerInterval = setInterval(() => {
      if (tokenExpiration) {
        setTokenExpiration((prev) => new Date(prev.getTime() - 1000));
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.navigate('Login');
  };

  const showTokenDetails = () => {
    swal({
      title: "Your Authentication Token",
      text: token,
      icon: "info",
      buttons: {
        copy: {
          text: "Copy Token",
          value: "copy",
        },
        cancel: "Cancel",
      },
    }).then((value) => {
      if (value === "copy") {
        navigator.clipboard.writeText(token);
        swal("Copied!", "Your token has been copied to clipboard.", "success");
      }
    });
  };

  const formatTimeLeft = () => {
    if (!tokenExpiration) return '';
    const timeLeft = tokenExpiration - new Date();
    if (timeLeft < 0) {
      swal('Token expired', 'Your session has expired. Please log in again.', 'error')
        .then(() => {
          AsyncStorage.removeItem('token');
          navigation.navigate('Login');
        });
      return 'expired';
    }
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>
          {formatTimeLeft()}
        </Text>
      </View>
      <Text style={styles.welcome}>Welcome, {user.username}!</Text>
      <Text>Permissions: {user.permissions.join(', ')}</Text>
      <Button title="Show Token" onPress={showTokenDetails} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    marginBottom: 20,
  },
  timerContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
