import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	TouchableOpacity,
	Alert,
	Button,
	StyleSheet,
	Modal,
	ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

const AProgramsScreen = () => {
	const navigation = useNavigation();
	const [programs, setPrograms] = useState([]);
	const [filteredPrograms, setFilteredPrograms] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [newProgram, setNewProgram] = useState({
		name: "",
		description: "",
		application_start_date: "",
		application_end_date: "",
		status: "", 
	});

	useEffect(() => {
		fetchPrograms();
	}, []);

	const fetchPrograms = async () => {
		try {
			const jwtToken = await AsyncStorage.getItem("jwt_token");
			if (!jwtToken) {
				Alert.alert("You need to login to view programs");
				navigation.replace("Login");
				return;
			}

			const response = await axios.get(
				"http://10.0.2.2:5000/programs",
				{
					headers: {
						Authorization: `Bearer ${jwtToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			setPrograms(response.data);
			setFilteredPrograms(response.data);
		} catch (error) {
			Alert.alert("Error fetching programs", error.message);
		}
	};

	const filterPrograms = (query) => {
		setSearchQuery(query);
		const filtered = programs.filter((program) => {
			return (
				program.name.toLowerCase().includes(query.toLowerCase()) ||
				program.description
					.toLowerCase()
					.includes(query.toLowerCase()) ||
				program.status.toLowerCase().includes(query.toLowerCase()) ||
				program.application_end_date
					.toLowerCase()
					.includes(query.toLowerCase()) ||
				program.application_start_date
					.toLowerCase()
					.includes(query.toLowerCase()) ||
				program.id.toString().includes(query.toLowerCase())
			);
		});
		setFilteredPrograms(filtered);
	};

	const deleteProgram = async (programId) => {
		const jwtToken = await AsyncStorage.getItem("jwt_token");
		try {
			const response = await axios.delete(
				`http://10.0.2.2:5000/admin/program/${programId}`,
				{
					headers: {
						Authorization: `Bearer ${jwtToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.status === 200) {
				Alert.alert("Program deleted successfully");
				fetchPrograms(); // Refresh the program list
			} else {
				Alert.alert("Failed to delete program");
			}
		} catch (error) {
			Alert.alert("Failed to delete program", error.message);
		}
	};

	const confirmDelete = (programId) => {
		Alert.alert(
			"Are you sure?",
			"Do you really want to delete this program?",
			[
				{
					text: "No",
				},
				{
					text: "Yes",
					onPress: () => deleteProgram(programId),
				},
			],
			{ cancelable: true }
		);
	};

	const createProgram = async () => {
		// Validate inputs
		if (
			!newProgram.name ||
			!newProgram.description ||
			!newProgram.application_start_date ||
			!newProgram.application_end_date
		) {
			Alert.alert("Error", "All fields are required");
			return;
		}

		try {
			const jwtToken = await AsyncStorage.getItem("jwt_token");
			if (!jwtToken) {
				Alert.alert("Authorization Error", "You need to login again");
				navigation.replace("Login");
				return;
			}

			const response = await axios.post(
				"http://10.0.2.2:5000/admin/newprogram",
				{
					name: newProgram.name,
					description: newProgram.description,
					application_start_date: newProgram.application_start_date,
					application_end_date: newProgram.application_end_date,
					status: newProgram.status,
				},
				{
					headers: {
						Authorization: `Bearer ${jwtToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.status === 201) {
				Alert.alert("Success", "Program added successfully");
				setModalVisible(false);
				// Reset form fields
				setNewProgram({
					name: "",
					description: "",
					application_start_date: "",
					application_end_date: "",
					status: "",
				});
				fetchPrograms(); // Refresh the program list
			} else {
				Alert.alert("Error", "Failed to add program");
			}
		} catch (error) {
			Alert.alert("Error", error.message || "Failed to add program");
		}
	};

	const renderProgramItem = ({ item }) => (
		<TouchableOpacity
			style={styles.programItem}
			onPress={() =>
				navigation.navigate("Admin Program Details", {
					id: item.id,
					name: item.name,
					description: item.description,
					applicationStartDate: item.application_start_date,
					applicationEndDate: item.application_end_date,
					status: item.status,
				})
			}
			onLongPress={() => confirmDelete(item.id)}
		>
			<Text style={styles.programTitle}>{item.name}</Text>
			<Text
				numberOfLines={2}
				ellipsizeMode="tail"
				style={styles.programDescription}
			>
				{item.description}
			</Text>
			<Text>Status: {item.status}</Text>
			<Text style={styles.programEndDate}>
				Ends: {item.application_end_date}
			</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.searchInput}
				placeholder="Search Programs"
				value={searchQuery}
				onChangeText={filterPrograms}
			/>
			<Text style={styles.longPressHint}>
				Long press a program to delete it
			</Text>
			<Button title="Add Program" onPress={() => setModalVisible(true)} />

			<FlatList
				data={filteredPrograms}
				renderItem={renderProgramItem}
				keyExtractor={(item) => item.id.toString()}
				onRefresh={fetchPrograms}
				refreshing={false}
			/>

			{/* Add Program Modal */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<ScrollView>
							<Text style={styles.modalTitle}>
								Add New Program
							</Text>

							<Text style={styles.inputLabel}>Program Name</Text>
							<TextInput
								style={styles.modalInput}
								placeholder="Enter program name"
								value={newProgram.name}
								onChangeText={(text) =>
									setNewProgram({ ...newProgram, name: text })
								}
							/>

							<Text style={styles.inputLabel}>Description</Text>
							<TextInput
								style={[styles.modalInput, styles.textArea]}
								placeholder="Enter description"
								multiline
								numberOfLines={4}
								value={newProgram.description}
								onChangeText={(text) =>
									setNewProgram({
										...newProgram,
										description: text,
									})
								}
							/>

							<Text style={styles.inputLabel}>
								Start Date (MM-DD-YYYY)
							</Text>
							<TextInput
								style={styles.modalInput}
								placeholder="MM-DD-YYYY"
								value={newProgram.application_start_date}
								onChangeText={(text) =>
									setNewProgram({
										...newProgram,
										application_start_date: text,
									})
								}
							/>

							<Text style={styles.inputLabel}>
								End Date (MM-DD-YYYY)
							</Text>
							<TextInput
								style={styles.modalInput}
								placeholder="MM-DD-YYYY"
								value={newProgram.application_end_date}
								onChangeText={(text) =>
									setNewProgram({
										...newProgram,
										application_end_date: text,
									})
								}
							/>

							<Text style={styles.inputLabel}>Status</Text>
							{/* <TextInput
								style={styles.modalInput}
								placeholder="Status (Open, Closed)"
								value={newProgram.status}
								onChangeText={(text) =>
									setNewProgram({
										...newProgram,
										status: text,
									})
								}
							/> */}
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={newProgram.status}
									style={styles.picker}
									onValueChange={(itemValue) =>
										setNewProgram({
											...newProgram,
											status: itemValue,
										})
									}
								>
									<Picker.Item label="Open" value="Open" />
									<Picker.Item
										label="Closed"
										value="Closed"
									/>
								</Picker>
							</View>

							<View style={styles.modalButtons}>
								<TouchableOpacity
									style={[styles.button, styles.buttonCancel]}
									onPress={() => setModalVisible(false)}
								>
									<Text style={styles.buttonText}>
										Cancel
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.button, styles.buttonSubmit]}
									onPress={createProgram}
								>
									<Text style={styles.buttonText}>
										Create
									</Text>
								</TouchableOpacity>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	searchInput: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 10,
		marginBottom: 16,
	},
	longPressHint: {
		fontStyle: "italic",
		marginBottom: 8,
	},
	programItem: {
		marginVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 16,
	},
	programTitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	programDescription: {
		marginBottom: 8,
	},
	programEndDate: {
		color: "red",
	},
	buttonContainer: {
		marginVertical: 10,
	},
	// Modal styles
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalView: {
		width: "90%",
		maxHeight: "80%",
		backgroundColor: "white",
		borderRadius: 20,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 15,
		textAlign: "center",
	},
	inputLabel: {
		fontSize: 16,
		marginBottom: 5,
		marginTop: 10,
	},
	modalInput: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		padding: 10,
		marginBottom: 10,
	},
	textArea: {
		height: 100,
		textAlignVertical: "top",
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},
	button: {
		borderRadius: 10,
		padding: 10,
		elevation: 2,
		width: "48%",
	},
	buttonCancel: {
		backgroundColor: "#f44336",
	},
	buttonSubmit: {
		backgroundColor: "#4CAF50",
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	label: {
		fontSize: 16,
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 4,
		padding: 10,
		marginBottom: 16,
	},
	pickerContainer: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 4,
		marginBottom: 16,
		backgroundColor: "#fff",
	},
	picker: {
		height: 50,
	},
});

export default AProgramsScreen;
