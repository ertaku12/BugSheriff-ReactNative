import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	StyleSheet,
	Alert,
	TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
	const navigation = useNavigation();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const apiUrl = "http://10.0.2.2:5000/login"; // Flask API URL

	const loginUser = async () => {
		if (!username || !password) {
			Alert.alert("Please fill in both fields");
			return;
		}

		setLoading(true);
		try {
			// Make POST request to login endpoint
			const response = await axios.post(
				apiUrl,
				{ username, password },
				{
					// Custom status validation - consider both 200 and 401 as valid responses
					// (normally Axios throws errors for non-2xx status codes)
					validateStatus: function (status) {
						return status === 200 || status === 401;
					},
				}
			);

			// Successful login (200 OK)
			if (response.status === 200) {
				// Extract JWT token from response
				const { access_token } = response.data;

				// Store token in persistent storage
				await AsyncStorage.setItem("jwt_token", access_token);

				// Navigate to different screens based on user role
				if (username === "admin") {
					navigation.navigate("Admin's Home"); // Admin dashboard
				} else {
					navigation.navigate("Programs"); // Regular user screen
				}
			}
			// Unauthorized access (401)
			else if (response.status === 401) {
				// Show invalid credentials message
				Alert.alert("Wrong username or password");
			}
		} catch (error) {
			// This catch will only handle network errors or other exceptions
			// (not 401 errors, since we configured validateStatus)
			// Show generic error message for unexpected failures
			Alert.alert("An error occurred during login");
			console.error("Login error:", error);
		} finally {
			// This always runs to cleanup loading state
			setLoading(false); // Disable loading spinner
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Welcome Back</Text>
			<Text style={styles.subHeader}>
				Enter your credentials to login
			</Text>

			<TextInput
				style={styles.input}
				placeholder="Username"
				value={username}
				onChangeText={setUsername}
			/>

			<TextInput
				style={styles.input}
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			<TouchableOpacity onPress={loginUser} style={styles.button}>
				<Text style={styles.buttonText}>
					{loading ? "Logging in..." : "Login"}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				onPress={() => navigation.navigate("Forgot Password")}
			>
				<Text style={styles.link}>Forgot password?</Text>
			</TouchableOpacity>

			<View style={styles.signupContainer}>
				<Text>Don't have an account? </Text>
				<TouchableOpacity onPress={() => navigation.navigate("Signup")}>
					<Text style={styles.link}>Sign Up</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 24,
	},
	header: {
		fontSize: 40,
		fontWeight: "bold",
		textAlign: "center",
	},
	subHeader: {
		textAlign: "center",
		marginBottom: 20,
	},
	input: {
		height: 50,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 18,
		paddingHorizontal: 10,
		marginBottom: 10,
	},
	button: {
		backgroundColor: "#6200ea",
		borderRadius: 18,
		paddingVertical: 16,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 20,
	},
	link: {
		color: "#6200ea",
		textAlign: "center",
	},
	signupContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 20,
	},
});

export default LoginScreen;
