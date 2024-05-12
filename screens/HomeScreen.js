import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, Card } from '@rneui/themed';
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
        setToken(storedToken);

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

    const timerInterval = setInterval(() => {
      if (tokenExpiration) {
        const currentTime = new Date();
        const timeLeft = tokenExpiration - currentTime;
        if (timeLeft < 0) {
          swal('Token expired', 'Your session has expired. Please log in again.', 'error')
            .then(() => {
              AsyncStorage.removeItem('token');
              navigation.navigate('Login');
            });
        }
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
    const currentTime = new Date();
    const timeLeft = tokenExpiration - currentTime;
    if (timeLeft < 0) {
      return 'Expired';
    }
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const renderImage = () => {
    let imageSrc;
    if (user.permissions.includes('admin')) {
      imageSrc = require('../assets/elon.jpg');
    } else {
      imageSrc = require('../assets/cat.jpg');
    }

    return <Image source={imageSrc} style={styles.image} />;
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
        <Text style={styles.timer}>Token Expires in: {formatTimeLeft()}</Text>
      </View>
      <Card>
        <Card.Title>Welcome, {user.username}!</Card.Title>
        <Card.Divider />
        <Text>Permissions: {user.permissions.join(', ')}</Text>
        <Button title="Show Token" onPress={showTokenDetails} containerStyle={styles.button} />
        <Button title="Logout" onPress={handleLogout} type="outline" containerStyle={styles.button} />
      </Card>
      {renderImage()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  button: {
    marginTop: 10,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 20,
  },
});
