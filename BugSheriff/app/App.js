import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import Layout from './_layout';

const App = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;