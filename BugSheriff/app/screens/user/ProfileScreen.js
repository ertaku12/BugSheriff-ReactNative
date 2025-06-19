import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	ActivityIndicator,
	TouchableOpacity,
	ScrollView,
	RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { Snackbar } from "react-native-paper";

const ProfileScreen = () => {
	const navigation = useNavigation();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [secretAnswer, setSecretAnswer] = useState("");
	const [iban, setIban] = useState("");
	const [selectedSecretQuestion, setSelectedSecretQuestion] = useState("");
	const [loading, setLoading] = useState(false);
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [refreshing, setRefreshing] = useState(false);

	const secretQuestions = [
		"What is your pet's name?",
		"What is your mother's maiden name?",
		"What is your favorite book?",
	];

	useEffect(() => {
		fetchUserDetails();
	}, []);

	const showSnackbar = (message) => {
		setSnackbarMessage(message);
		setSnackbarVisible(true);
	};

	const fetchUserDetails = async () => {
		const jwtToken = await AsyncStorage.getItem("jwt_token");

		if (!jwtToken) {
			showSnackbar("You need to login to view your profile");
			setTimeout(() => navigation.navigate("Login"), 2000);
			return;
		}
		setLoading(true);

		try {
			const response = await axios.get(
				"http://10.0.2.2:5000/user-details",
				{
					headers: {
						Authorization: `Bearer ${jwtToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			const data = response.data;
			setUsername(data.username);
			setSelectedSecretQuestion(data.secret_question);
			setSecretAnswer(data.secret_answer);
			setIban(data.iban);
		} catch (error) {
			showSnackbar("Session expired. Redirecting to login...");
			await AsyncStorage.removeItem("jwt_token");
			setTimeout(() => navigation.replace("Login"), 2000);
		} finally {
			setLoading(false);
		}
	};

	const updateUserDetails = async () => {
		if (password !== confirmPassword) {
			showSnackbar("Passwords don't match");
			return;
		}

		setLoading(true);

		try {
			const jwtToken = await AsyncStorage.getItem("jwt_token");

			const response = await axios.put(
				"http://10.0.2.2:5000/update-user",
				{
					password,
					secret_question: selectedSecretQuestion,
					secret_answer: secretAnswer,
					iban,
				},
				{
					headers: {
						Authorization: `Bearer ${jwtToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.status === 200) {
				showSnackbar("Profile updated successfully!");
			} else {
				showSnackbar("Failed to update profile");
			}
		} catch (error) {
			showSnackbar("Error updating profile");
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchUserDetails();
		setRefreshing(false);
	};

	if (loading) {
		return <ActivityIndicator size="large" color="#6200ea" />;
	}

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollContainer}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				}
			>
				<Text style={styles.header}>User Profile</Text>
				<Text style={styles.label}>Username: {username}</Text>

				<TextInput
					style={styles.input}
					placeholder="New Password"
					secureTextEntry
					value={password}
					onChangeText={setPassword}
				/>
				<TextInput
					style={styles.input}
					placeholder="Confirm New Password"
					secureTextEntry
					value={confirmPassword}
					onChangeText={setConfirmPassword}
				/>

				<Picker
					selectedValue={selectedSecretQuestion}
					style={styles.input}
					onValueChange={(itemValue) =>
						setSelectedSecretQuestion(itemValue)
					}
				>
					{secretQuestions.map((question, index) => (
						<Picker.Item
							key={index}
							label={question}
							value={question}
						/>
					))}
				</Picker>

				<TextInput
					style={styles.input}
					placeholder="Secret Answer"
					value={secretAnswer}
					onChangeText={setSecretAnswer}
				/>

				<TextInput
					style={styles.input}
					placeholder="IBAN"
					value={iban}
					onChangeText={setIban}
				/>

				<TouchableOpacity
					style={styles.button}
					onPress={updateUserDetails}
				>
					<Text style={styles.buttonText}>Update Profile</Text>
				</TouchableOpacity>
			</ScrollView>

			{/* Snackbar Component */}
			<Snackbar
				visible={snackbarVisible}
				onDismiss={() => setSnackbarVisible(false)}
				duration={3000}
				style={styles.snackbar}
			>
				{snackbarMessage}
			</Snackbar>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
	},
	label: {
		fontSize: 18,
		marginBottom: 8,
	},
	input: {
		height: 50,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 8,
		marginBottom: 16,
		paddingHorizontal: 10,
	},
	button: {
		backgroundColor: "#6200ea",
		paddingVertical: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
	},
});

export default ProfileScreen;
