import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  Button, 
  StyleSheet, 
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Snackbar } from 'react-native-paper';

const ReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    fetchReports();
  }, []);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 3000); // Hides snackbar after 3 seconds
  };

  const fetchReports = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwt_token');
      if (!jwtToken) {
        showSnackbar('You need to login to view reports');
        setTimeout(() => navigation.navigate("Login"), 2000); // Navigate to login after 2 seconds
        return;
      }

      const response = await fetch('http://10.0.2.2:5000/reports', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setReports(data);
        setFilteredReports(data);
      } else {
        showSnackbar(data.message || 'Failed to fetch reports');
      }
    } catch (error) {
      showSnackbar('Network error. Please try again.');
      console.error('Fetch reports error:', error);
    }
  };

  const downloadAndOpenPDF = async (reportPath) => {
    if (downloading) return;
    setDownloading(true);

    try {
      const jwtToken = await AsyncStorage.getItem('jwt_token');
      if (!jwtToken) {
        showSnackbar('Authentication required');
        return;
      }

      const filename = reportPath.split('/').pop() || 'report.pdf';
      const downloadUrl = `http://10.0.2.2:5000/uploads/${reportPath}`;
      const localUri = `${FileSystem.cacheDirectory}${filename}`;

      // Check if file exists and is not corrupted
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists || fileInfo.size === 0) {
        const downloadResult = await FileSystem.downloadAsync(
          downloadUrl,
          localUri,
          { headers: { Authorization: `Bearer ${jwtToken}` } }
        );

        if (downloadResult.status !== 200) {
          throw new Error('Download failed with status: ' + downloadResult.status);
        }
      }

      // For Android, we'll use Sharing which works well for PDFs
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Open PDF Report',
          UTI: 'com.adobe.pdf'
        });
      } else {
        // Fallback for iOS or when sharing isn't available
        await WebBrowser.openBrowserAsync(localUri);
      }

    } catch (error) {
      console.error('PDF Error:', error);
      showSnackbar('Could not open PDF. Make sure you have a PDF viewer installed.');
    } finally {
      setDownloading(false);
    }
  };

  const filterReports = (query) => {
    const searchQuery = query.toLowerCase();
    setSearchText(searchQuery);
    
    if (!query) {
      setFilteredReports(reports);
      return;
    }

    const filtered = reports.filter(report => 
      report.id.toString().toLowerCase().includes(searchQuery) ||
      report.status.toLowerCase().includes(searchQuery) ||
      report.program_name.toLowerCase().includes(searchQuery) ||
      report.reward_amount.toString().toLowerCase().includes(searchQuery)
    );
    
    setFilteredReports(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports().finally(() => setRefreshing(false));
  };

  const renderReportItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Report ID: {item.id}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardText}>Status: {item.status}</Text>
        <Text style={styles.cardText}>Program: {item.program_name}</Text>
        <Text style={styles.cardText}>Reward: ${item.reward_amount}</Text>
      </View>
      <View style={styles.buttonContainer}>
        {downloading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Button
            title="View PDF"
            onPress={() => downloadAndOpenPDF(item.report_pdf_path)}
            color="#007AFF"
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Reports</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search reports..."
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={filterReports}
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filteredReports}
        renderItem={renderReportItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchText ? 'No matching reports found' : 'No reports available'}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Snackbar Component */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}  // Display for 3 seconds
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
  },
  searchInput: {
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  cardContent: {
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    marginBottom: 4,
    color: '#555',
  },
  buttonContainer: {
    minHeight: 40,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  snackbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default ReportsScreen;
