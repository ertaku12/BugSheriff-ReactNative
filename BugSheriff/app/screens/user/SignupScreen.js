import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const SignupScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const secretQuestions = [
    "What is your pet's name?",
    "What is your mother's maiden name?",
    "What is your favorite book?"
  ];

  const navigation = useNavigation();

  // Register user function
  const registerUser = async (username, password, secretQuestion, secretAnswer) => {
    const apiUrl = 'http://10.0.2.2:5000/register'; // Update with your backend URL
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          secret_question: secretQuestion,
          secret_answer: secretAnswer,
        }),
      });

      if (response.status === 201) {
        return true; // Registration successful
      } else {
        return false; // Registration failed
      }
    } catch (e) {
      console.error('Registration error:', e);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (username && password && secretAnswer && selectedQuestion) {
      if (password === confirmPassword) {
        setIsLoading(true);
        const success = await registerUser(username, password, selectedQuestion, secretAnswer);
        setIsLoading(false);
        
        if (success) {
          Alert.alert('Success', 'User registered successfully!');
          navigation.navigate('Login');
        } else {
          Alert.alert('Error', 'User already exists or server error occurred!');
        }
      } else {
        Alert.alert('Error', 'Passwords do not match!');
      }
    } else {
      Alert.alert('Error', 'Please fill in all fields!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Secret Question</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedQuestion}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedQuestion(itemValue)}
            >
              <Picker.Item label="Select a Secret Question" value={null} />
              {secretQuestions.map((question, index) => (
                <Picker.Item key={index} label={question} value={question} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Secret Answer</Text>
          <TextInput
            style={styles.input}
            placeholder="Answer to your secret question"
            value={secretAnswer}
            onChangeText={setSecretAnswer}
          />
        </View>

        <TouchableOpacity 
          style={styles.signupButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  formContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 52,
  },
  signupButton: {
    backgroundColor: '#5E72E4',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#666',
  },
  loginButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loginButtonText: {
    color: '#5E72E4',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SignupScreen;