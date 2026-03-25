import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Appbar, Avatar, Text, Searchbar, IconButton, useTheme } from 'react-native-paper';
import { colors } from '../theme/colors';
import { usePermissions } from '../context/PermissionContext';
import { ROLES } from '../utils/permissions';
import { NotificationBell } from './NotificationBell';

export const Header = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { user, userRole, logout } = usePermissions();

  const onChangeSearch = query => setSearchQuery(query);

  // In Electron, we might need a more direct way to apply drag regions
  // since React Native Web might strip vendor-prefixed style properties.
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'electron-drag-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          .electron-drag { -webkit-app-region: drag !important; }
          .electron-no-drag { -webkit-app-region: no-drag !important; }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const isElectron = Platform.OS === 'web' && (window.electron || (typeof process !== 'undefined' && process.versions && process.versions.electron));

  return (
    <Appbar.Header style={[styles.header]} elevated dataSet={Platform.OS === 'web' ? { class: 'electron-drag' } : {}}>
      <View style={[styles.left]} dataSet={Platform.OS === 'web' ? { class: 'electron-no-drag' } : {}}>
        <Avatar.Icon 
          size={32} 
          icon="shield-alert" 
          style={{ backgroundColor: theme.colors.primary }} 
          color="white"
        />
        <View>
          <Text variant="titleMedium" style={styles.logoText}>
            SecureAccess <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Admin</Text>
          </Text>
          <Text variant="labelSmall" style={{ marginLeft: 8, color: colors.slate400 }}>
            Session: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{userRole}</Text>
          </Text>
        </View>
      </View>

      <View style={[styles.center]} dataSet={Platform.OS === 'web' ? { class: 'electron-no-drag' } : {}}>
        <Searchbar
          placeholder="Search logs, users..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />
      </View>

      <View style={[styles.rightActions]} dataSet={Platform.OS === 'web' ? { class: 'electron-no-drag' } : {}}>
        <IconButton 
          icon="logout-variant" 
          onPress={logout} 
          tooltip="Logout" 
        />
        <NotificationBell />
        <View style={styles.avatarWrapper}>
          <View style={styles.userInfo}>
            <Text variant="labelMedium" style={styles.userName}>{user?.name || 'Admin User'}</Text>
          </View>
          <Avatar.Text 
            size={32} 
            label={user?.initials || 'AU'} 
            style={{ backgroundColor: colors.indigo100 }}
            labelStyle={{ color: colors.primary, fontWeight: 'bold' }}
          />
        </View>
        {(isElectron || window.electron) && (
          <View style={styles.windowControls}>
            <IconButton 
              icon="minus" 
              size={20} 
              onPress={() => window.electron?.windowControls?.minimize()} 
              style={styles.windowButton} 
            />
            <IconButton 
              icon="window-maximize" 
              size={20} 
              onPress={() => window.electron?.windowControls?.maximize()} 
              style={styles.windowButton} 
            />
            <IconButton 
              icon="close" 
              size={20} 
              onPress={() => window.electron?.windowControls?.close()} 
              style={styles.windowButton} 
              iconColor={colors.red600} 
            />
          </View>
        )}
      </View>
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  center: {
    flex: 1,
    maxWidth: 400,
    marginHorizontal: 24,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchbar: {
    height: 40,
    backgroundColor: colors.slate50,
    elevation: 0,
  },
  searchInput: {
    minHeight: 0,
    fontSize: 14,
  },
  avatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 8,
  },
  userInfo: {
    display: Platform.OS === 'web' ? 'flex' : 'none',
    alignItems: 'flex-end',
  },
  userName: {
    fontWeight: 'bold',
    color: colors.slate900,
  },
  windowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: colors.slate200,
    paddingLeft: 8,
  },
  windowButton: {
    margin: 0,
  }
});
