import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import swal from 'sweetalert';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tokenExpiration, setTokenExpiration] = useState(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.post('http://localhost:3000/validate', { token });
        if (response.data.valid) {
          navigation.navigate('Home');
        } else {
          swal("Your session has expired. Please log in again.", { icon: "warning" });
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        swal("Failed to validate session. Please log in again.", { icon: "error" });
      }
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      swal('Please fill in all fields.', { icon: 'error' });
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/login', { username, password });
      const { token, expiresAt } = response.data;
      await AsyncStorage.setItem('token', token);
      setTokenExpiration(new Date(expiresAt));
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login error:', error);
      swal('Invalid credentials', { icon: 'error' });
    }
  };

  const handleTokenInput = async () => {
    let storedToken = await AsyncStorage.getItem('token');

    if (!storedToken) {
      swal({
        title: "Enter Token",
        text: "Please enter your authentication token:",
        content: "input",
        button: {
          text: "Validate Token",
          closeModal: false,
        },
      }).then(token => {
        if (!token) throw new Error("No token provided.");

        // Validate JWT format
        const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
        if (!jwtPattern.test(token)) {
          throw new Error("Invalid token format. Please enter a valid JWT.");
        }

        storedToken = token;
        return axios.post('http://localhost:3000/validate', { token });
      })
        .then(response => processTokenValidation(response, storedToken))
        .catch(error => {
          if (error.response && error.response.data) {
            swal("Error", error.response.data.message + ` Expired at ${new Date(error.response.data.expiresAt)}`, "error");
          } else {
            swal("Error", error.message, "error");
          }
        });
    } else {
      axios.post('http://localhost:3000/validate', { token: storedToken })
        .then(response => processTokenValidation(response, storedToken))
        .catch(error => {
          swal("Failed to validate session. Please log in again." + error, { icon: "error" });
          AsyncStorage.removeItem('token');
        });
    }
  };

  const processTokenValidation = (response, token) => {
    const { valid, expiresAt } = response.data;

    if (valid) {
      swal("Success", `Token is valid and stored successfully! Expires at: ${new Date(expiresAt)}`, "success");
      // AsyncStorage.setItem('token', token);
      // setTokenExpiration(new Date(expiresAt));
      // navigation.navigate('Home');
    } else {
      swal("Error", `Token has expired at ${new Date(expiresAt)}`, "error");
      // AsyncStorage.removeItem('token');
    }
  };

  return (
    <View style={styles.container}>
      <Text h2 style={styles.heading}>Login</Text>
      <Input
        placeholder="Username"
        onChangeText={setUsername}
        value={username}
        autoCapitalize="none"
        id='username-input'
        leftIcon={{ type: 'font-awesome', name: 'user' }}
      />
      <Input
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        autoCapitalize="none"
        id='password-input'
        leftIcon={{ type: 'font-awesome', name: 'lock' }}
      />
      <Button title="Login" onPress={handleLogin} containerStyle={styles.button} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} type="outline" containerStyle={styles.button} />
      <Button title="Validate Token" onPress={handleTokenInput} type="clear" titleStyle={styles.validateButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
  },
  validateButton: {
    color: 'blue',
    marginTop: 20,
  },
});