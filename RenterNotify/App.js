import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import { loadSession, loadAlerts, saveAlerts } from './src/storage';
import { fetchAlerts } from './src/api';
import { mapAndPruneAlerts } from './src/alerts';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState('');
  const receivedListener = useRef();
  const responseListener = useRef();
  const fetchingRef = useRef(false);
  const sessionRef = useRef(null);

  // Keep sessionRef in sync so notification listeners always read the latest session.
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Restore an existing session + the last day's alerts on launch.
  useEffect(() => {
    (async () => {
      const stored = await loadSession();
      if (stored) setSession(stored);
      const alerts = await loadAlerts(); // cached list, shown instantly
      setNotifications(alerts);
      setBooting(false);
      if (stored) refreshAlerts(stored); // then refresh from the server
    })();
  }, []);

  // Pull the authoritative alert list from the backend (access logs), prune to
  // the last 30 days, show it, and cache it. The server is the source of truth,
  // so alerts that arrived while the app was closed still appear here.
  const refreshAlerts = async (activeSession) => {
    const s = activeSession || sessionRef.current;
    if (!s?.registrationNumber || !s?.phone) return; // legacy session: keep cache
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setAlertsLoading(true);
    setAlertsError('');
    try {
      const payload = await fetchAlerts({
        registrationNumber: s.registrationNumber,
        phone: s.phone,
      });
      const mapped = mapAndPruneAlerts(payload);
      setNotifications(mapped);
      await saveAlerts(mapped);
    } catch (err) {
      setAlertsError(err.message || 'Could not refresh alerts');
    } finally {
      fetchingRef.current = false;
      setAlertsLoading(false);
    }
  };

  // Collect incoming notifications (foreground) and taps (from a closed app).
  useEffect(() => {
    receivedListener.current = Notifications.addNotificationReceivedListener(() => {
      refreshAlerts();
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      refreshAlerts();
    });
    return () => {
      if (receivedListener.current) receivedListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  if (booting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={session ? 'dark' : 'light'} />
      {session ? (
        <HomeScreen
          session={session}
          notifications={notifications}
          onLogout={() => {
            setNotifications([]);
            saveAlerts([]);
            setSession(null);
          }}
          onRefresh={() => refreshAlerts()}
          refreshing={alertsLoading}
          error={alertsError}
        />
      ) : (
        <LoginScreen onLogin={setSession} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});
