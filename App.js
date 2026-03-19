import './global.css';
import 'react-native-gesture-handler';

import 'react-native-reanimated';
import { registerRootComponent } from 'expo';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { PublicSans_400Regular, PublicSans_700Bold, PublicSans_900Black } from '@expo-google-fonts/public-sans';
import { Header } from './src/components/Header';
import { Sidebar } from './src/components/Sidebar';
import { ResponsiveLayout } from './src/components/ResponsiveLayout';
import { Dashboard } from './src/screens/Dashboard';
import { UserManagement } from './src/screens/UserManagement';
import * as Screens from './src/screens/RemainingScreens';
import { BiometricTerminal } from './src/screens/BiometricTerminal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Overview');

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'PublicSans-Regular': PublicSans_400Regular,
          'PublicSans-Bold': PublicSans_700Bold,
          'PublicSans-Black': PublicSans_900Black,
        });
      } catch (e) {
        console.warn('Fonts failed to load', e);
      } finally {
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.backgroundDark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const renderScreen = () => {
    let Content;
    switch (currentScreen) {
      case 'Dashboard':
      case 'Overview': Content = <Dashboard />; break;
      case 'Users':
      case 'UserManagement': Content = <UserManagement />; break;
      case 'Registrations': Content = <Screens.Registrations />; break;
      case 'ActiveRenters': Content = <Screens.ActiveRenters />; break;
      case 'AccessLogs': Content = <Screens.AccessLogs />; break;
      case 'AuditLogs': Content = <Screens.AuditLogs />; break;
      case 'Permissions': Content = <Screens.Permissions />; break;
      case 'SystemHealth': Content = <Screens.SystemHealth />; break;
      case 'Configuration': Content = <Screens.Configuration />; break;
      case 'Devices': Content = <Screens.DeviceManagement />; break;
      case 'FingerprintUI': Content = <Screens.FingerprintUI />; break;
      case 'BiometricTerminal': Content = <BiometricTerminal onExit={() => setCurrentScreen('Dashboard')} />; break;
      case 'AdminInteractive': Content = <Screens.AdminInteractive />; break;
      default: Content = <Dashboard />; break;
    }

    return (
      <View
        key={currentScreen}
        style={{ flex: 1, width: '100%' }}
      >
        {Content}
      </View>
    );
  };

  if (currentScreen === 'BiometricTerminal') {
    return (
      <SafeAreaProvider>
        {renderScreen()}
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ResponsiveLayout
        header={<Header />}
        sidebar={<Sidebar currentScreen={currentScreen} onNavigate={setCurrentScreen} />}
      >
        {renderScreen()}
      </ResponsiveLayout>
    </SafeAreaProvider>
  );
}
