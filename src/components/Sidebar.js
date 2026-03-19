import React from 'react';

import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LayoutDashboard, Users, History, Shield, Activity, Settings, UserPlus, Fingerprint, Cpu, Smartphone } from 'lucide-react-native';

const MENU_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, screen: 'Dashboard' },
  { label: 'Interactive', icon: Activity, screen: 'AdminInteractive' },
  { label: 'Users', icon: Users, screen: 'UserManagement' },
  { label: 'Registrations', icon: UserPlus, screen: 'Registrations', badge: '12' },
  { label: 'Active Renters', icon: Users, screen: 'ActiveRenters' },
  { label: 'Access Logs', icon: History, screen: 'AccessLogs' },
  { label: 'Audit Logs', icon: History, screen: 'AuditLogs' },
  { section: 'System' },
  { label: 'Devices', icon: Cpu, screen: 'Devices' },
  { label: 'Terminal Mode', icon: Fingerprint, screen: 'BiometricTerminal' },
  { label: 'Security', icon: Shield, screen: 'Permissions' },
  { label: 'System Health', icon: Activity, screen: 'SystemHealth' },
  { label: 'Configuration', icon: Settings, screen: 'Configuration' },
];

export const Sidebar = ({ currentScreen, onNavigate }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Main Menu</Text>
      {MENU_ITEMS.map((item, index) => {
        if (item.section) {
          return <Text key={index} style={[styles.sectionHeader, { marginTop: 32 }]}>{item.section}</Text>;
        }
        
        const Icon = item.icon;
        const isActive = currentScreen === item.screen;
        
        return (
          <TouchableOpacity 
            key={index} 
            style={[styles.item, isActive && styles.activeItem]}
            onPress={() => onNavigate(item.screen)}
          >
            {Icon && <Icon size={20} color={isActive ? colors.primary : colors.slate400} />}
            <Text style={[styles.text, isActive && styles.activeText]}>{item.label}</Text>
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flex: 1,
  },
  sectionHeader: {
    ...typography.tiny,
    color: colors.slate400,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    marginBottom: 8,
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 12,
    marginBottom: 4,
  },
  activeItem: {
    backgroundColor: 'rgba(17, 50, 212, 0.1)',
  },
  text: {
    ...typography.body,
    fontSize: 14,
    color: colors.slate400,
  },
  activeText: {
    color: colors.primary,
    fontWeight: '600',
  },
  badge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(17, 50, 212, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    ...typography.tiny,
    color: colors.primary,
    fontSize: 10,
  },
});
