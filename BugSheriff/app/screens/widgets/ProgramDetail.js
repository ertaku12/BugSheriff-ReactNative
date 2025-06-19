import React from "react";
import { View, Text, Button, StyleSheet, Alert, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { logger } from "react-native-logs";

const log = logger.createLogger();

const ProgramDetail = ({ route }) => {
	const navigation = useNavigation();
	const {
		id,
		name,
		description,
		applicationStartDate,
		applicationEndDate,
		status,
	} = route.params;

	const uploadReport = async () => {
		try {
			// Select PDF file using expo-document-picker
			const res = await DocumentPicker.getDocumentAsync({
				type: "application/pdf",
				copyToCacheDirectory: true,
			});

			log.info(
				"Document Picker Result (Full):",
				JSON.stringify(res, null, 2)
			);

			// Correct handling of document picker result
			if (res.canceled) {
				log.error("No file selected");
				Alert.alert("Error", "No file selected");
				return;
			}

			// Check if assets exist and have a file
			if (!res.assets || res.assets.length === 0) {
				log.error("No file assets found");
				Alert.alert("Error", "Unable to select file");
				return;
			}

			const file = res.assets[0];

			log.info(`File selected: ${file.name}, URI: ${file.uri}`);

			// Get JWT token
			const jwtToken = await AsyncStorage.getItem("jwt_token");
			if (!jwtToken) {
				Alert.alert("Error", "You need to login to upload reports");
				navigation.replace("Login");
				return;
			}

			// Prepare FormData for upload
			const formData = new FormData();
			formData.append("file", {
				uri:
					Platform.OS === "android"
						? file.uri
						: file.uri.replace("file://", ""),
				type: file.mimeType || "application/pdf",
				name: file.name,
			});
			formData.append("program_id", id);

			log.info("FormData prepared:", {
				fileUri: file.uri,
				fileName: file.name,
				mimeType: file.mimeType,
				programId: id,
			});

			// Upload the file
			const response = await axios.post(
				"http://10.0.2.2:5000/upload",
				formData,
				{
					headers: {
						Authorization: `Bearer ${jwtToken}`,
						"Content-Type": "multipart/form-data",
					},
					timeout: 10000, // 10 seconds timeout
				}
			);

			if (response.status === 200) {
				Alert.alert("Success", "Report uploaded successfully");
				log.info("Report uploaded successfully");
			} else {
				const errorMessage = response.data.message || "Upload failed";
				Alert.alert("Error", errorMessage);
				log.error(`Upload failed: ${errorMessage}`);
			}
		} catch (error) {
			// More detailed error logging
			log.error("Upload error details:", {
				message: error.message,
				code: error.code,
				response: error.response
					? JSON.stringify(error.response.data)
					: "No response",
			});

			// Network error specific handling
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				log.error(
					"Server Error Response:",
					JSON.stringify(error.response.data, null, 2)
				);
				Alert.alert(
					"Upload Error",
					error.response.data.message || "File upload failed"
				);
			} else if (error.request) {
				// The request was made but no response was received
				Alert.alert(
					"Network Error",
					"Unable to connect to the server. Please check your internet connection."
				);
			} else {
				// Something happened in setting up the request that triggered an Error
				Alert.alert("Error", "File upload failed: " + error.message);
			}
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{name}</Text>

			<Text style={styles.label}>Description:</Text>
			<Text style={styles.text}>{description}</Text>

			<Text style={styles.label}>Start Date:</Text>
			<Text style={styles.text}>{applicationStartDate}</Text>

			<Text style={styles.label}>End Date:</Text>
			<Text style={styles.text}>{applicationEndDate}</Text>

			<Text style={styles.label}>Status:</Text>
			<Text
				style={[
					styles.text,
					{ color: status === "Active" ? "green" : "red" },
				]}
			>
				{status}
			</Text>

			<Button title="Upload Report (PDF)" onPress={uploadReport} />

			<View style={styles.goBackButton}>
				<Button
					title="Go Back"
					onPress={() => navigation.navigate("Programs")}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "#f5f5f5",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
		color: "#333",
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		marginTop: 12,
		color: "#333",
	},
	text: {
		fontSize: 16,
		marginBottom: 10,
		color: "#555",
	},
	goBackButton: {
		marginTop: 20,
		width: "100%",
		alignSelf: "center",
		paddingVertical: 10,
	},
});

export default ProgramDetail;
