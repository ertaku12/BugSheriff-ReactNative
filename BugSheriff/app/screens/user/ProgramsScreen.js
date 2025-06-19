// ProgramsScreen.js

import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	Button,
	Alert,
	StyleSheet,
	RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Correct import
import { Snackbar } from "react-native-paper";

const ProgramsScreen = () => {
	const [programs, setPrograms] = useState([]);
	const [filteredPrograms, setFilteredPrograms] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const navigation = useNavigation();
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchPrograms();
	}, []);

	const showSnackbar = (message) => {
		setSnackbarMessage(message);
		setSnackbarVisible(true);
	};

	const fetchPrograms = async () => {
		const jwtToken = await AsyncStorage.getItem("jwt_token");

		if (!jwtToken) {
			showSnackbar("You need to login to view your profile");
			setTimeout(() => navigation.navigate("Login"), 2000);
			return;
		}
		setLoading(true);

		const apiUrl = "http://10.0.2.2:5000/programs";
		try {
			const response = await fetch(apiUrl, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${jwtToken}`,
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();
			if (response.status === 200) {
				setPrograms(data);
				setFilteredPrograms(data);
			} else {
				Alert.alert("Error", data.message || "Unknown error");
			}
		} catch (error) {
			showSnackbar("Session expired. Redirecting to login...");
			await AsyncStorage.removeItem("jwt_token");
			setTimeout(() => navigation.replace("Login"), 2000);
		} finally {
			setLoading(false);
		}
	};

	const filterPrograms = (query) => {
		setSearchQuery(query);
		const lowercasedQuery = query.toLowerCase();
		const filtered = programs.filter((program) => {
			return (
				program.name.toLowerCase().includes(lowercasedQuery) ||
				program.description.toLowerCase().includes(lowercasedQuery) ||
				program.status.toLowerCase().includes(lowercasedQuery) ||
				program.application_end_date
					.toLowerCase()
					.includes(lowercasedQuery) ||
				program.application_start_date
					.toLowerCase()
					.includes(lowercasedQuery) ||
				program.id.toString().includes(lowercasedQuery)
			);
		});
		setFilteredPrograms(filtered);
	};

	const onRefresh = () => {
		setRefreshing(true);
		fetchPrograms().finally(() => setRefreshing(false));
	};

	const renderProgramItem = ({ item }) => (
		<View style={styles.card}>
			<Text style={styles.cardTitle}>{item.name}</Text>
			<Text style={styles.cardDescription} numberOfLines={2}>
				{item.description}
			</Text>
			<View style={styles.cardFooter}>
				<Text>Status: {item.status}</Text>
				<Text style={styles.cardDate}>
					Ends: {item.application_end_date}
				</Text>
			</View>
			<Button
				title="View Details"
				onPress={() =>
					navigation.navigate("Program Details", {
						id: item.id.toString(),
						name: item.name,
						description: item.description,
						applicationStartDate: item.application_start_date,
						applicationEndDate: item.application_end_date,
						status: item.status,
					})
				}
			/>
		</View>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Programs</Text>
			</View>

			<TextInput
				style={styles.searchInput}
				placeholder="Search programs"
				value={searchQuery}
				onChangeText={filterPrograms}
			/>

			<FlatList
				data={filteredPrograms}
				renderItem={renderProgramItem}
				keyExtractor={(item) => item.id.toString()}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				}
				ListEmptyComponent={<Text>No programs found</Text>}
			/>
			<Snackbar
				visible={snackbarVisible}
				onDismiss={() => setSnackbarVisible(false)}
				duration={Snackbar.DURATION_SHORT} 
			>
				{snackbarMessage}
			</Snackbar>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
	},
	searchInput: {
		height: 50,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 12,
		marginBottom: 20,
		paddingLeft: 15,
		backgroundColor: "#f0f0f0",
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 15,
		marginBottom: 15,
		elevation: 3,
	},
	cardTitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	cardDescription: {
		color: "gray",
		marginTop: 5,
	},
	cardFooter: {
		marginTop: 10,
		alignItems: "flex-end",
	},
	cardDate: {
		color: "red",
	},
});

export default ProgramsScreen;
