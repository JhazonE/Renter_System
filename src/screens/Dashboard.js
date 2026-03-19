import React from 'react';

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Users, ShieldCheck, AlertTriangle, ArrowUp } from 'lucide-react-native';

const StatCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={[styles.iconBox, { backgroundColor: `${color}1A` }]}>
        <Icon size={20} color={color} />
      </View>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardValue}>{value}</Text>
      {trend && (
        <View style={styles.trendBox}>
          <ArrowUp size={12} color={colors.emerald500} />
          <Text style={styles.trendText}>{trend}</Text>
        </View>
      )}
    </View>
    <Text style={styles.cardSubtext}>{subtext}</Text>
  </View>
);

export const Dashboard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        <StatCard 
          title="Active Renters" 
          value="1,284" 
          subtext="Current capacity at 84%" 
          icon={Users} 
          color={colors.primary}
          trend="12.5%"
        />
        <StatCard 
          title="Access Granted (24h)" 
          value="3,492" 
          subtext="Peak activity: 08:30 AM" 
          icon={ShieldCheck} 
          color={colors.emerald500}
          trend="4.2%"
        />
        <StatCard 
          title="Security Alerts" 
          value="3" 
          subtext="Failed attempts: 2, Unauthorized: 1" 
          icon={AlertTriangle} 
          color={colors.amber500}
        />
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Pending Registrations</Text>
            <Text style={styles.sectionSub}>Review new access requests for approval</Text>
          </View>
          <Text style={styles.viewAll}>View All</Text>
        </View>
        
        {/* Table placeholder */}
        <View style={styles.tablePlaceholder}>
          <Text style={typography.body}>[ Registration Table Implementation In Progress ]</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1200,
    gap: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  card: {
    flexGrow: 1,
    flexBasis: 300,
    minWidth: 280,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(17, 50, 212, 0.1)',
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    ...typography.body,
    color: colors.slate400,
    fontWeight: '500',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  cardValue: {
    ...typography.h1,
    color: colors.white,
    fontSize: 32,
  },
  trendBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    ...typography.tiny,
    color: colors.emerald500,
  },
  cardSubtext: {
    ...typography.caption,
    color: colors.slate500,
    marginTop: 8,
  },
  section: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(17, 50, 212, 0.1)',
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17, 50, 212, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.white,
    margin: 0,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.slate400,
  },
  viewAll: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  tablePlaceholder: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
