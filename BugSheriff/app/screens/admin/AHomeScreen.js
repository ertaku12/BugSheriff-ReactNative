// screens/AHomeScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler'; // If you want to add any custom button functionality

const AHomePage = () => {
  const navigation = useNavigation();

  // Function to toggle the drawer menu if needed
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        
        <Text style={styles.title}>BugSheriff Bug Bounty Platform</Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          The Bug Bounty Program is an initiative that invites hackers and
          security researchers to find and report vulnerabilities in our
          systems. By identifying potential security issues, we aim to improve
          the overall safety of our platform and protect our users. Participants
          are rewarded for their findings, creating a collaborative approach to
          security enhancement.
        </Text>

        <Image
          source={require('../../../assets/default.jpeg')}
          style={styles.image}
          resizeMode="contain"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2196F3',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuIconText: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 400,
  },
});

export default AHomePage;
