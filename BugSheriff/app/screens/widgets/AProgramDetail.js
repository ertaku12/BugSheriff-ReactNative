import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const ProgramDetailPage = ({ route, navigation }) => {
  const {
    id,
    name,
    description,
    applicationStartDate,
    applicationEndDate,
    status,
  } = route.params;



  // Format date from GMT to MM-DD-YYYY
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "";
      
      // Check if it's already in MM-DD-YYYY format
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        return dateString;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${month}-${day}-${year}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  const [programName, setProgramName] = useState(name);
  const [programDescription, setProgramDescription] = useState(description);
  const [startDate, setStartDate] = useState(formatDate(applicationStartDate));
  const [endDate, setEndDate] = useState(formatDate(applicationEndDate));
  const [programStatus, setProgramStatus] = useState(status);

  useFocusEffect(
    useCallback(() => {
      setProgramName(name);
      setProgramDescription(description);
      setStartDate(formatDate(applicationStartDate));
      setEndDate(formatDate(applicationEndDate));
      setProgramStatus(status);
    }, [route.params])
  );

  const convertToAPIDateFormat = (dateString) => {
    try {
      if (!dateString) return "";
      
      // If it's in MM-DD-YYYY format, convert to API format
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [month, day, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
      }
      
      return dateString; // Return as is if not in expected format
    } catch (error) {
      console.error("Date conversion error:", error);
      return dateString;
    }
  };

  const updateProgram = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem("jwt_token");

      if (!jwtToken) {
        Alert.alert(
          "Authentication Error",
          "You need to login to update the program"
        );
        navigation.navigate("Login");
        return;
      }

      // Convert dates to API format if needed
      const apiStartDate = convertToAPIDateFormat(startDate);
      const apiEndDate = convertToAPIDateFormat(endDate);

      const response = await axios.put(
        `http://10.0.2.2:5000/admin/program/${id}`,
        {
          name: programName,
          description: programDescription,
          application_start_date: apiStartDate,
          application_end_date: apiEndDate,
          status: programStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Program updated successfully");
        // Stay on the same page instead of navigating away
      } else {
        Alert.alert("Error", "Failed to update program");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        "An error occurred while updating the program"
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={programName}
        onChangeText={setProgramName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        value={programDescription}
        onChangeText={setProgramDescription}
      />

      <Text style={styles.label}>Start Date (MM-DD-YYYY)</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="MM-DD-YYYY"
      />

      <Text style={styles.label}>End Date (MM-DD-YYYY)</Text>
      <TextInput
        style={styles.input}
        value={endDate}
        onChangeText={setEndDate}
        placeholder="MM-DD-YYYY"
      />

      <Text style={styles.label}>Status</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={programStatus}
          style={styles.picker}
          onValueChange={(itemValue) => setProgramStatus(itemValue)}
        >
          <Picker.Item label="Open" value="Open" />
          <Picker.Item label="Closed" value="Closed" />
        </Picker>
      </View>

      <Button title="Update Program" onPress={updateProgram} />

      <View style={styles.goBackButton}>
        <Button
          title="Go Back"
          onPress={() => navigation.navigate("Admin's Programs")}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  goBackButton: {
    marginTop: 20,
    width: "100%",
    alignSelf: "center",
    paddingVertical: 10,
  },
});

export default ProgramDetailPage;