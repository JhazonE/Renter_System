import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { Users, ShieldCheck, AlertTriangle, ArrowUp } from 'lucide-react-native';

const StatCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
  <View 
    className="flex-grow basis-[300px] min-w-[280px] bg-white rounded-2xl border border-slate-100 p-6 m-2"
    style={Platform.OS === 'web' 
      ? { boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.05)' } 
      : { shadowColor: colors.slate900, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }
    }
  >
    <View className="flex-row justify-between mb-4">
      <Text className="text-sm font-semibold text-slate-500 font-sans">{title}</Text>
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={22} color={color} />
      </View>
    </View>
    <View className="flex-row items-baseline gap-2">
      <Text className="text-slate-900 text-4xl font-black">{value}</Text>
      {trend && (
        <View className="flex-row items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <ArrowUp size={12} color={colors.emerald600} />
          <Text className="text-[11px] font-bold text-emerald-600">{trend}</Text>
        </View>
      )}
    </View>
    <Text className="text-xs text-slate-400 mt-2 font-sans font-medium">{subtext}</Text>
  </View>
);

export const Dashboard = () => {
  return (
    <ScrollView className="flex-1 w-full" showsVerticalScrollIndicator={false}>
      <View className="w-full max-w-[1200px] mx-auto flex-col gap-8">
        <View className="flex-row flex-wrap justify-between -m-2">
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
        
        <View 
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-8"
          style={Platform.OS === 'web' 
            ? { boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.05)' } 
            : { shadowColor: colors.slate900, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 }
          }
        >
          <View className="p-6 border-b border-slate-50 flex-row justify-between items-center bg-white">
            <View>
              <Text className="text-lg font-bold text-slate-900">Pending Registrations</Text>
              <Text className="text-xs text-slate-500 font-sans mt-1">Review new access requests for approval</Text>
            </View>
            <TouchableOpacity className="bg-indigo-50 px-4 py-2 rounded-lg">
              <Text className="text-sm font-bold text-primary">View All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="p-16 items-center justify-center bg-slate-50/30">
            <Text className="text-sm text-slate-400 font-sans font-medium italic">[ Registration Table Implementation In Progress ]</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
