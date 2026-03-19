import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { ShieldAlert, Search, Bell } from 'lucide-react-native';

export const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logoBox}>
          <ShieldAlert size={20} color={colors.white} />
        </View>
        <Text style={styles.logoText}>SecureAccess <Text style={{ color: colors.primary }}>Admin</Text></Text>
      </View>
      
      <View style={styles.right}>
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.slate400} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search logs, users..."
            placeholderTextColor={colors.slate400}
          />
        </View>
        
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={20} color={colors.slate400} />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
        
        <View style={styles.avatar}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmRVEBYjLyw0eYPajKSwMRWiqJdeN8U9Tteo890Qpr7JH4n_T6DC0_ZXJJDpHuJRxyLO-pc0VvK48M5UStgnwAlP_IXAUG7KR7O8_9U9NJg9MRYdnyPLcu5yjaxMCv2slx4fsgOpKfStSSxrq1hTpBAiGoW0IEK7c5iVsIfJe0SOcAbYGT0idI9OZPcHh2sR1JMS5XKufSATz78VNIUG486Xpkr5oDsl7-iUoT0cvnvouv9H2_Ko0I6tmEiZhY1wY0a_iyXt-X6Vja' }}
            style={styles.avatarImg}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    ...typography.h3,
    color: colors.slate900,
    letterSpacing: -0.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginLeft: 'auto',
  },
  searchContainer: {
    position: 'relative',
    display: 'none', // Hidden on mobile, show on desktop via responsive logic in future
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 10,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: colors.slate50,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 16,
    height: 38,
    width: 256,
    color: colors.slate900,
    ...typography.body,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    position: 'relative',
    backgroundColor: colors.slate50,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.rose500,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(17, 50, 212, 0.3)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
});
