import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";

const AReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [selectedRewards, setSelectedRewards] = useState({});
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [statusDropdowns, setStatusDropdowns] = useState({});
  const navigation = useNavigation();

  // Show toast notification with custom message
  const showMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Fetch JWT Token from AsyncStorage
  const fetchToken = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt_token");
      setJwtToken(token);
    } catch (error) {
      console.error("Error fetching token", error);
      showMessage("Error fetching authentication token");
    }
  };

  // Fetch Reports
  const fetchReports = useCallback(async () => {
    if (!jwtToken) {
      showMessage("Authentication required");
      navigation.navigate("Admin's Login");
      return;
    }

    try {
      const response = await axios.get(
        "http://10.0.2.2:5000/admin/getreports",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setReports(response.data);
      setFilteredReports(response.data);
      setLoading(false);
      setSelectedStatuses(
        response.data.reduce((acc, report) => {
          acc[report.id] = report.status;
          return acc;
        }, {})
      );
      setSelectedRewards(
        response.data.reduce((acc, report) => {
          acc[report.id] = report.reward_amount.toString();
          return acc;
        }, {})
      );
    } catch (error) {
      setLoading(false);
      showMessage("Failed to fetch reports");
      console.error("Fetch reports error", error);
    }
  }, [jwtToken, navigation]);

  useEffect(() => {
    fetchToken();
  }, []);

  useEffect(() => {
    if (jwtToken) {
      fetchReports();
    }
  }, [jwtToken, fetchReports]);

  // Filter Reports
  const filterReports = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredReports(reports);
    } else {
      setFilteredReports(
        reports.filter(
          (report) =>
            report.id.toString().includes(query) ||
            report.program_name
              .toLowerCase()
              .includes(query.toLowerCase()) ||
            report.status.toLowerCase().includes(query.toLowerCase()) ||
            report.reward_amount.toString().includes(query)
        )
      );
    }
  };

  // Update Report Status and Reward
  const updateReport = async (reportId, status, reward) => {
    if (!jwtToken) {
      showMessage("Authentication required");
      return;
    }

    try {
      const response = await axios.put(
        `http://10.0.2.2:5000/admin/report/${reportId}`,
        { status, reward_amount: reward },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        showMessage("Report updated successfully!");
        fetchReports();
      }
    } catch (error) {
      showMessage("Failed to update report");
      console.error("Update report error", error);
    }
  };

  // Download and Open PDF
  const downloadAndOpenPDF = async (reportPath) => {
    if (downloading) return;
    setDownloading(true);

    try {
      if (!jwtToken) {
        showMessage("Authentication required");
        return;
      }

      const filename = reportPath.split("/").pop() || "report.pdf";
      const downloadUrl = `http://10.0.2.2:5000/admin/uploads/${reportPath}`;
      const localUri = `${FileSystem.cacheDirectory}${filename}`;

      showMessage("Downloading PDF...");

      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists || fileInfo.size === 0) {
        const downloadResult = await FileSystem.downloadAsync(
          downloadUrl,
          localUri,
          { headers: { Authorization: `Bearer ${jwtToken}` } }
        );

        if (downloadResult.status !== 200) {
          throw new Error(
            "Download failed with status: " + downloadResult.status
          );
        }
      }

      showMessage("Opening PDF...");

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: "application/pdf",
          dialogTitle: "Open PDF Report",
          UTI: "com.adobe.pdf",
        });
      } else {
        await WebBrowser.openBrowserAsync(localUri);
      }
    } catch (error) {
      console.error("PDF Error:", error);
      showMessage(
        "Could not open PDF. Make sure you have a PDF viewer installed."
      );
    } finally {
      setDownloading(false);
    }
  };

  // Toggle status dropdown
  const toggleStatusDropdown = (reportId) => {
    setStatusDropdowns(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  const handleStatusChange = (newStatus, reportId) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [reportId]: newStatus,
    }));
    setStatusDropdowns(prev => ({
      ...prev,
      [reportId]: false
    }));
  };

  // Copy IBAN to Clipboard
  const copyToClipboard = async (iban) => {
    try {
      await Clipboard.setStringAsync(iban);
      showMessage("IBAN copied to clipboard");
    } catch (error) {
      console.error("Copy to clipboard error:", error);
      showMessage("Failed to copy IBAN");
    }
  };

  // Render Report Item
  const renderReportItem = ({ item: report }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{`Report ID: ${report.id}`}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardContent}>
        <Text style={styles.programName}>{report.program_name}</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => toggleStatusDropdown(report.id)}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedStatuses[report.id] || report.status}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            
            {statusDropdowns[report.id] && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleStatusChange("Pending", report.id)}
                >
                  <Text>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleStatusChange("Accepted", report.id)}
                >
                  <Text>Accepted</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleStatusChange("Rejected", report.id)}
                >
                  <Text>Rejected</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Reward:</Text>
          <TextInput
            placeholder="Amount"
            value={selectedRewards[report.id] || ""}
            onChangeText={(reward) => {
              setSelectedRewards((prev) => ({
                ...prev,
                [report.id]: reward,
              }));
            }}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>IBAN:</Text>
          <View style={styles.ibanContainer}>
            <Text
              style={styles.ibanText}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {report.iban}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(report.iban)}
            >
              <Text style={styles.copyButtonText}>Kopyala</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            updateReport(
              report.id,
              selectedStatuses[report.id],
              selectedRewards[report.id]
            )
          }
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.viewPdfButton]}
          onPress={() => downloadAndOpenPDF(report.report_pdf_path)}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>View PDF</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Refresh Reports
  const refreshReports = () => {
    setLoading(true);
    fetchReports();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search by ID, Program Name, Status, or Reward"
          value={searchQuery}
          onChangeText={filterReports}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
      </View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={refreshReports}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : filteredReports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noReportsText}>No reports found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: "#fff",
    borderRadius: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  refreshButton: {
    margin: 16,
    backgroundColor: "#007AFF",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  cardContent: {
    padding: 16,
  },
  programName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 16,
    color: "#444",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    width: 70,
    color: "#555",
  },
  dropdownContainer: {
    flex: 1,
    position: "relative",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: "#333",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#666",
  },
  dropdownMenu: {
    position: "absolute",
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 12,
  },
  ibanContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ibanText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginRight: 10,
  },
  copyButton: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    width: 80,
  },
  copyButtonText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#f9f9f9",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    marginHorizontal: 5,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewPdfButton: {
    backgroundColor: "#FF9500",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReportsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  toast: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default AReportsScreen;