import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import axios from 'axios';
import swal from 'sweetalert';

export default function RegisterScreen({ navigation }) {
    // State variables for form inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        // Trim the input values to remove leading/trailing whitespace
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        // Check for empty fields
        if (!trimmedUsername || !trimmedPassword || !trimmedConfirmPassword) {
            swal('Please fill in all fields.', { icon: 'error' });
            return;
        }

        // Check if password meets the minimum length requirement
        if (trimmedPassword.length < 6) {
            swal('Password must be at least 6 characters long.', { icon: 'error' });
            return;
        }

        // Check if password and confirm password match
        if (trimmedPassword !== trimmedConfirmPassword) {
            swal('Passwords do not match.', { icon: 'error' });
            return;
        }

        try {
            // Send a POST request to the server for registration
            await axios.post('http://localhost:3000/register', { username: trimmedUsername, password: trimmedPassword });

            // Show a success message using SweetAlert
            swal('Registration successful. Please login.', { icon: 'success' })
                .then(() => {
                    // Clear the input fields
                    setUsername('');
                    setPassword('');
                    setConfirmPassword('');

                    // Navigate to the Login screen
                    navigation.navigate('Login');
                });
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response && error.response.status === 400) {
                swal('Username already exists', { icon: 'error' });
            } else {
                swal('An error occurred during registration', { icon: 'error' });
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text h2 style={styles.heading}>Register</Text>
            <Input
                placeholder="Username"
                onChangeText={setUsername}
                value={username}
                autoCapitalize="none"
                leftIcon={{ type: 'font-awesome', name: 'user' }}
            />
            <Input
                placeholder="Password"
                onChangeText={setPassword}
                value={password}
                secureTextEntry
                autoCapitalize="none"
                leftIcon={{ type: 'font-awesome', name: 'lock' }}
            />
            <Input
                placeholder="Confirm Password"
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                secureTextEntry
                autoCapitalize="none"
                leftIcon={{ type: 'font-awesome', name: 'lock' }}
            />
            <Button title="Register" onPress={handleRegister} containerStyle={styles.button} />
        </View>
    );
}

// Styles for the RegisterScreen component
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
});
