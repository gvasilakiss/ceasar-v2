import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
          navigation.navigate('Login');
          return;
        }

        const response = await axios.post('http://localhost:3000/validate', { token });
        const { valid, user } = response.data;

        if (!valid) {
          throw new Error('Invalid token');
        }

        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        await AsyncStorage.removeItem('token');
        navigation.navigate('Login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.navigate('Login');
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
      <Text style={styles.welcome}>Welcome, {user.username}!</Text>
      <Text>Permissions: {user.permissions.join(', ')}</Text>
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
});
