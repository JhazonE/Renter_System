import React, { useState, useMemo, useEffect } from 'react';

import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import axios from 'axios';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Search, CheckCircle, XCircle, Clock, Filter, ChevronRight, UserPlus, Fingerprint, Smartphone, Cpu, Activity, ShieldCheck, Database, History } from 'lucide-react-native';
import { Table } from '../components/Table';

const API_URL = 'http://localhost:5000/api/registrations'; // Update this with your machine's IP if testing on physical device

const MOCK_REGISTRATIONS = [
  { id: '1', name: 'Alex Rivera', email: 'alex.r@enterprise.com', unit: 'Unit 402', level: 'VIP', time: '10:42 AM', initials: 'AR', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA69nSUmovo6-HW6dCUTtgmjT955EF1cXEPjDvODJBTmuElCi4btf4JIawfcLiO60LJwQ0QF92DgHhOxP2nDpAgo9MZTCs04vPN2vsIDMvS4Fn0hsNIm__8XsYmjDNINGmh4xR1ZL8wXw6U7cGebUbA2Q_32Sh8BRjZWbi8Jc27Nr4NIyiqwLFKbn7u0oQzdKyHQ8cZsdAgReR3h12DQzMHA-rJwfjo8HO-UukNhk3KKYSb9DfLu8HeH5wpCs8ccKRN0t_URWii8tC5', status: 'Pending', date: '2023-11-24', hasFingerprint: true },
  { id: '2', name: 'Jordan Smith', email: 'jsmith_42@gmail.com', unit: 'Suite 12', level: 'Standard', time: '09:15 AM', initials: 'JS', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhI39moDeXEs1CgHm0O-UKdU4VjiJN2PVU2osp5r9qpw9EHS_SR6I8w1XMVz7z98QEgh0QzehYabUNmafUr6XA2dGGSU5BssSRIcVXkh4lMtlbje4VArfaCHuMYHZQzs7mcnKPQNilMirZhCJOU5yb_O5Ezk8XO_TbbQVKU00C4rwZwuGYKC0qhqUy_Z2TPMChmLRWrmBj1d2EDzo30y7XYmDXSULxZZqhOwX16SZ1ZYgnxC5JJExnP8TgdOwEerFkKyjwIF6tZin2', status: 'Approved', date: '2023-11-23', hasFingerprint: false },
  { id: '3', name: 'Casey Chen', email: 'labs.maintenance@facility.io', unit: 'Main Lab', level: 'Maintenance', time: '08:30 AM', initials: 'CC', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgK36s7ERHb11ZUBUbz1_AjVAQNRiJHVEbW_d6ei0U3fLTJqHgFtLhxlzfBQrdm8ytl1b6j5gzhKJsxagktA5qeqzCfP5d2gqwt1VwiBGZY9YVdKVeJ5UPxDUYxFEkxOm17D_qQgN_TUJ8lAIhTpofRCGbKBvsGAgfQDY5HXJn3T7dXb7Pr4sB5VPimw9VdiqaOo4HLM-h1CYN98XQYoqZ_CnKp-c2vJhJMa3EStwjQSd9y8hMCvz7kgWWL3A5s2GcVQ4A1ZTZ2-t5', status: 'Pending', date: '2023-11-22', hasFingerprint: true },
  { id: '4', name: 'Morgan Taylor', email: 'm.taylor@skyline.res', unit: 'Unit 105', level: 'Standard', time: '11:15 PM', initials: 'MT', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8qQJdZdNSeDomXBHD5rwpPiw-2iAMY2cHskcop4mWcDg6eD4NzUS0mE4TpkvYFLv5musEKiouslfVrEKEDahBMzla0G4sF4SXCabRMWvqltj_I1zzyuYJdZJGTpV0Yo98iaxAJcsAh77LEIxCCu-Is6l4BI65AdomUDGe2iSgc1DUGRhhqSMBQSUfUQsRM5XKxOluH4oK0j5SI0ue6nEmF7lq2MDyh8zvKrUIFpJVbB7xbh8G5kO035gmFWLqeSNjpmMG7BaMCRRY', status: 'Approved', date: '2023-11-21', hasFingerprint: false },
  { id: '5', name: 'Riley Webb', email: 'r.webb@proton.me', unit: 'Unit 303', level: 'VIP', time: '2 days ago', initials: 'RW', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvBdtRA8ab0zLqdXFNRUvlEmu0WzYUbrL8DqTiLXwYJMtvDrPycctiBj-rm56p_J7bagR4NF0maaZovc2yP5a92sYkpdh8fEP2TUHtkXPAlHH7Y3EZvpXdo2Sh8QEZhuOA2wGFk_qnN7COx219C227-lg2a-O5Detw7GL-Gt5ex43Twa_lGOvrPLkIiAF7ZMNQV0nAOAKG6O3wEXaXghVjIfNhGNs6ar4Dj6DKT0m_pjXkcjhZVflCEc-uZsN_wP0PKexuwzbCFPV2', status: 'Rejected', date: '2023-11-20', hasFingerprint: true },
];

const MOCK_ACTIVE_RENTERS = [
  { id: '1', name: 'Alex Rivera', email: 'alex.r@enterprise.com', unit: 'Unit 402', level: 'VIP', time: '10:42 AM', initials: 'AR', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA69nSUmovo6-HW6dCUTtgmjT955EF1cXEPjDvODJBTmuElCi4btf4JIawfcLiO60LJwQ0QF92DgHhOxP2nDpAgo9MZTCs04vPN2vsIDMvS4Fn0hsNIm__8XsYmjDNINGmh4xR1ZL8wXw6U7cGebUbA2Q_32Sh8BRjZWbi8Jc27Nr4NIyiqwLFKbn7u0oQzdKyHQ8cZsdAgReR3h12DQzMHA-rJwfjo8HO-UukNhk3KKYSb9DfLu8HeH5wpCs8ccKRN0t_URWii8tC5' },
  { id: '2', name: 'Jordan Smith', email: 'jsmith_42@gmail.com', unit: 'Suite 12', level: 'Standard', time: '09:15 AM', initials: 'JS', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhI39moDeXEs1CgHm0O-UKdU4VjiJN2PVU2osp5r9qpw9EHS_SR6I8w1XMVz7z98QEgh0QzehYabUNmafUr6XA2dGGSU5BssSRIcVXkh4lMtlbje4VArfaCHuMYHZQzs7mcnKPQNilMirZhCJOU5yb_O5Ezk8XO_TbbQVKU00C4rwZwuGYKC0qhqUy_Z2TPMChmLRWrmBj1d2EDzo30y7XYmDXSULxZZqhOwX16SZ1ZYgnxC5JJExnP8TgdOwEerFkKyjwIF6tZin2' },
  { id: '3', name: 'Casey Chen', email: 'labs.maintenance@facility.io', unit: 'Main Lab', level: 'Maintenance', time: '08:30 AM', initials: 'CC', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgK36s7ERHb11ZUBUbz1_AjVAQNRiJHVEbW_d6ei0U3fLTJqHgFtLhxlzfBQrdm8ytl1b6j5gzhKJsxagktA5qeqzCfP5d2gqwt1VwiBGZY9YVdKVeJ5UPxDUYxFEkxOm17D_qQgN_TUJ8lAIhTpofRCGbKBvsGAgfQDY5HXJn3T7dXb7Pr4sB5VPimw9VdiqaOo4HLM-h1CYN98XQYoqZ_CnKp-c2vJhJMa3EStwjQSd9y8hMCvz7kgWWL3A5s2GcVQ4A1ZTZ2-t5' },
  { id: '4', name: 'Morgan Taylor', email: 'm.taylor@skyline.res', unit: 'Unit 105', level: 'Standard', time: '11:15 PM', initials: 'MT', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8qQJdZdNSeDomXBHD5rwpPiw-2iAMY2cHskcop4mWcDg6eD4NzUS0mE4TpkvYFLv5musEKiouslfVrEKEDahBMzla0G4sF4SXCabRMWvqltj_I1zzyuYJdZJGTpV0Yo98iaxAJcsAh77LEIxCCu-Is6l4BI65AdomUDGe2iSgc1DUGRhhqSMBQSUfUQsRM5XKxOluH4oK0j5SI0ue6nEmF7lq2MDyh8zvKrUIFpJVbB7xbh8G5kO035gmFWLqeSNjpmMG7BaMCRRY' },
  { id: '5', name: 'Riley Webb', email: 'r.webb@proton.me', unit: 'Unit 303', level: 'VIP', time: '2 days ago', initials: 'RW', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvBdtRA8ab0zLqdXFNRUvlEmu0WzYUbrL8DqTiLXwYJMtvDrPycctiBj-rm56p_J7bagR4NF0maaZovc2yP5a92sYkpdh8fEP2TUHtkXPAlHH7Y3EZvpXdo2Sh8QEZhuOA2wGFk_qnN7COx219C227-lg2a-O5Detw7GL-Gt5ex43Twa_lGOvrPLkIiAF7ZMNQV0nAOAKG6O3wEXaXghVjIfNhGNs6ar4Dj6DKT0m_pjXkcjhZVflCEc-uZsN_wP0PKexuwzbCFPV2' },
];

const MOCK_ACCESS_LOGS = [
  { id: '1', name: 'Jane Cooper', dept: 'Engineering Dept.', point: 'Server Room - 4A', location: 'HQ / SF', type: 'RFID Badge', status: 'Granted', date: '2023-11-24', time: '14:23:45 UTC', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7jIdfHrH6A5V8D7rj1xFjCAsj3UgEg5aoIoBDuKU35d5GNP8TYeKauSBl0YqWxyjmdcihVissWNWAg5bczQxOUdtAU9OdZZdaLeTLN4tERfUCsAJrKdasCJEpnkXmv77PnaPOhO59L6VrLZ-IzSSn0RNJTXlGsp4N1U5ZeaNVAn66FFDxROfKfLPvWV9vhzi2koc__JaKZF4FaI9QXmmMenvfjzbWRM8P9_v4kAo5P6Vx4hCa53O4vIXyEeidj8VDrOOwE6vEsD0e' },
  { id: '2', name: 'Unknown User', dept: 'Unauthorized Card', point: 'Main Entrance', location: 'DC / Ashburn', type: 'Magnetic Strip', status: 'Denied', date: '2023-11-24', time: '14:21:12 UTC' },
  { id: '3', name: 'Robert Fox', dept: 'IT Administrator', point: 'Network Closet B', location: 'London Office', type: 'Biometric Scan', status: 'Granted', date: '2023-11-24', time: '14:18:02 UTC', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD02DZ5OJO0FEdyG9D5RRR-mXLjDL5gVy3s9EIlijaR0qKXhI5aukP1KOBvQDaMOodBGVGwEGMg0EXRhwfNH-8qSAtaIO6_IbMSiUckwvBvcLciEWuYbjAlUnKxOZsDYxqzvoOf69hodabw_Mmc0sqFgAfbYWXit9zqKN-mUuAg8NRtdtl81ZzoQz1UUWQhbl0OgriczWsBm8Ck8-NvpF8Dh5zKLxWpYt_URWii8tC5' },
  { id: '4', name: 'Jenny Wilson', dept: 'HR Manager', point: 'Executive Wing', location: 'HQ / SF', type: 'Mobile Token', status: 'Granted', date: '2023-11-24', time: '14:15:59 UTC', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANt2ojhoB9nhJTnDsIjJmiybcmbqjUUH5oYIjm8Axjjotmt76xSgvMGPzsZ6aK1IV-AQ6ObTF8SLuoHmxPiQQhR3NwiL9LvZHAB-SYMujhGe_cWAoawlqh6crpN_7_wFx37ovRmaxBB7j7f31RJfZAe0_gL1dvvqOViZQXDcPvIwKspSXu9bQKVOnD3bw5v3VZYKIPVtFLw5r_3qMpuDtG5lNix1QkSfDY4mogQ8lS0yTKoYJF7S5nZOfdQSg7w5Rt9GS8feqtsnut' },
  { id: '5', name: 'Marcus Aurel', dept: 'External Vendor', point: 'Secure Archive', location: 'DC / Ashburn', type: 'RFID Badge', status: 'Denied', date: '2023-11-24', time: '14:12:30 UTC', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMWRapRDPPfToASwEpmmIqgGZueWg_C6VdpIeRPO9VvjdB2aC4uTR8Q5h7zyqcpLehGkFpSICo5QxuK5Fdeu5Uw7vE5WwGqNIsaX-Ol8hXGeY1Al9zHUvUUCcK1ll3_G5YqOdJFDVv8VJsgDJN9bdxbh8G5kO035gmFWLqeSNjpmMG7BaMCRRY' },
];

const MOCK_AUDIT_LOGS = [
  { id: '1', admin: 'Sarah Adams', adminId: 'ADM-9021', type: 'User Management', details: 'Approved Renter \'John Doe\'', subDetails: 'Access Key: BK-4412-X', status: 'Success', date: 'Oct 24, 2023', time: '14:32:01 UTC', initials: 'SA' },
  { id: '2', admin: 'Marcus Vance', adminId: 'ADM-1152', type: 'System Config', details: 'Changed OAuth Callback URL', subDetails: 'Env: Production', status: 'Success', date: 'Oct 24, 2023', time: '13:15:44 UTC', initials: 'MV' },
  { id: '3', admin: 'System Automator', adminId: 'Worker-04', type: 'Security Update', details: 'Auto-rotate Encryption Keys', subDetails: 'Standard weekly rotation', status: 'Failed', date: 'Oct 24, 2023', time: '11:02:18 UTC', initials: 'SY' },
  { id: '4', admin: 'Sarah Adams', adminId: 'ADM-9021', type: 'Other', details: 'Archived Logs Prior to 2022', subDetails: 'Storage Tier: Cold Archive', status: 'Success', date: 'Oct 23, 2023', time: '23:59:12 UTC', initials: 'SA' },
  { id: '5', admin: 'Elena Loft', adminId: 'ADM-4421', type: 'User Management', details: 'Revoked API Access for \'DevTeam-Alpha\'', subDetails: 'Reason: Policy Violation', status: 'Success', date: 'Oct 23, 2023', time: '18:22:10 UTC', initials: 'EL' },
];

const MOCK_PERMISSIONS = [
  { id: '1', role: 'Super Admin', users: 3, level: 'Full Access', lastUpdated: '2 days ago', status: 'Critical' },
  { id: '2', role: 'Security Officer', users: 12, level: 'Restricted', lastUpdated: '1 week ago', status: 'Active' },
  { id: '3', role: 'Facility Manager', users: 5, level: 'View Only', lastUpdated: '3 weeks ago', status: 'Active' },
  { id: '4', role: 'External Auditor', users: 2, level: 'Audit Only', lastUpdated: '1 month ago', status: 'Temporary' },
];

const MOCK_SYSTEM_HEALTH = [
  { id: '1', component: 'Authentication Server', status: 'Operational', uptime: '99.98%', latency: '24ms', load: '12%', statusColor: '#10B981' },
  { id: '2', component: 'Biometric Gateway', status: 'Operational', uptime: '99.95%', latency: '156ms', load: '45%', statusColor: '#10B981' },
  { id: '3', component: 'Primary Database', status: 'Operational', uptime: '100%', latency: '8ms', load: '22%', statusColor: '#10B981' },
  { id: '4', component: 'Edge Terminal - A1', status: 'Warning', uptime: '98.2%', latency: '842ms', load: '89%', statusColor: '#F59E0B' },
  { id: '5', component: 'Edge Terminal - B4', status: 'Operational', uptime: '99.9%', latency: '42ms', load: '5%', statusColor: '#10B981' },
];

const MOCK_CONFIG = [
  { id: '1', key: 'Access Protocol', value: 'High Security (v2.4)', category: 'Security', lastChanged: '3 months ago' },
  { id: '2', key: 'Encryption Level', value: 'AES-256-GCM', category: 'Security', lastChanged: '1 year ago' },
  { id: '3', key: 'Session Timeout', value: '15 Minutes', category: 'Auth', lastChanged: '2 weeks ago' },
  { id: '4', key: 'Backup Frequency', value: 'Every 6 Hours', category: 'System', lastChanged: '5 days ago' },
  { id: '5', key: 'API Rate Limit', value: '10,000 req/hr', category: 'Network', lastChanged: '1 month ago' },
];

const MOCK_DEVICES = [
  { id: '1', name: 'Main Entry Terminal', type: 'Bio-Scan Pro X', ip: '192.168.1.104', status: 'Online', lastSync: '12s ago', health: 98 },
  { id: '2', name: 'Server Room Lock', type: 'Mag-Lock Secure', ip: '192.168.1.105', status: 'Online', lastSync: '2m ago', health: 100 },
  { id: '3', name: 'Fingerprint Scanner 4', type: 'ZKTeco F22', ip: '192.168.1.108', status: 'Offline', lastSync: '3 days ago', health: 14 },
  { id: '4', name: 'Exit Gate A', type: 'Optical Sensor B1', ip: '192.168.1.110', status: 'Online', lastSync: '45s ago', health: 92 },
  { id: '5', name: 'Admin Enrollment Stn', type: 'USB Desktop Reader', ip: 'Localhost', status: 'Online', lastSync: 'Now', health: 100 },
];

const SkeletonScreen = ({ title, subtitle }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Implementation of {title} in progress...</Text>
    </View>
  </View>
);

export const Registrations = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  // Modal & Form State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    studentPhone: '', 
    parentPhone: '', 
    roomNo: '', 
    floorNo: '', 
    imd: '',
    hasFingerprint: false 
  });
  
  // Fingerprint Scanning State
  const [isFingerprinting, setIsFingerprinting] = useState(false);
  const [fingerprintProgress, setFingerprintProgress] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      Alert.alert('Error', 'Failed to fetch registrations from server.');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: data.length,
    pending: data.filter(r => r.status === 'Pending').length,
    approved: data.filter(r => r.status === 'Approved').length,
  }), [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const name = item.name || `${item.first_name} ${item.last_name}`;
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                           item.email.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'All' || item.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [data, search, filter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status: newStatus });
      setData(prev => prev.map(item => item.id === id ? response.data : item));
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update registration status.');
    }
  };

  const handleAddRegistration = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.roomNo) {
      Alert.alert('Validation Error', 'Please fill in all required fields (First Name, Last Name, Email, Room No)');
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`;
    const initials = (formData.firstName[0] || '') + (formData.lastName[0] || '');

    const newEntry = {
      ...formData,
      name: fullName,
      unit: `Room ${formData.roomNo}`,
      status: 'Pending',
      initials: initials.toUpperCase()
    };

    try {
      const response = await axios.post(API_URL, newEntry);
      setData(prev => [response.data, ...prev]);
      setFormData({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        studentPhone: '', 
        parentPhone: '', 
        roomNo: '', 
        floorNo: '', 
        imd: '',
        hasFingerprint: false 
      });
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error adding registration:', error);
      Alert.alert('Error', 'Failed to save registration to database.');
    }
  };

  const startFingerprintScan = () => {
    setIsFingerprinting(true);
    setFingerprintProgress(0);
    setScanCount(1);
    
    runScan(1);
  };

  const runScan = (currentScan) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setFingerprintProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        if (currentScan < 3) {
          setTimeout(() => {
            setFingerprintProgress(0);
            setScanCount(currentScan + 1);
            runScan(currentScan + 1);
          }, 800);
        } else {
          setTimeout(() => {
            setFormData(prev => ({ ...prev, hasFingerprint: true }));
            setIsFingerprinting(false);
            setScanCount(0);
          }, 500);
        }
      }
    }, 80);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Registrations</Text>
          <Text style={styles.subtitle}>Review and approve new registration requests from potential renters.</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <UserPlus size={18} color={colors.white} />
          <Text style={styles.addButtonText}>Manual Registration</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.indigo50 }]}>
            <Clock size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "rgba(245, 158, 11, 0.08)" }]}>
            <Clock size={22} color={colors.amber600} />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "rgba(16, 185, 129, 0.08)" }]}>
            <CheckCircle size={22} color={colors.emerald600} />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
        </View>
      </View>

      <View style={styles.filtersRow}>
        <View style={styles.tabs}>
          {['All', 'Pending', 'Approved', 'Rejected'].map(t => (
            <TouchableOpacity 
              key={t}
              onPress={() => setFilter(t)}
              style={[styles.tab, filter === t && styles.activeTab]}
            >
              <Text style={[styles.tabText, filter === t && styles.activeTabText]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.searchBox}>
          <Search size={16} color={colors.slate400} />
          <TextInput 
            placeholder="Search by name or email..." 
            placeholderTextColor={colors.slate400}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.tableCard}>
        <Table 
          headers={['Applicant', 'Requested Unit', 'Status', 'Date', 'Actions']}
          data={filteredData}
          renderRow={(item) => (
            <>
              <View style={[styles.cell, { flex: 1.5, flexDirection: 'row', gap: 12 }]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.initials}</Text>
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.userName}>{item.name}</Text>
                    {item.hasFingerprint && <Fingerprint size={12} color={colors.primary} />}
                  </View>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
              </View>
              <View style={styles.cell}>
                <Text style={styles.unitText}>{item.unit}</Text>
              </View>
              <View style={styles.cell}>
                <View style={[
                  styles.statusBadge, 
                  item.status === 'Approved' ? styles.approvedBadge : 
                  item.status === 'Rejected' ? styles.rejectedBadge : 
                  styles.pendingBadge
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    item.status === 'Approved' ? styles.approvedText : 
                    item.status === 'Rejected' ? styles.rejectedText : 
                    styles.pendingText
                  ]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.cell}>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              <View style={[styles.cell, styles.actionsCell]}>
                {item.status === 'Pending' ? (
                  <>
                    <TouchableOpacity onPress={() => handleStatusChange(item.id, 'Approved')}>
                      <CheckCircle size={18} color={colors.emerald500} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleStatusChange(item.id, 'Rejected')}>
                      <XCircle size={18} color={colors.rose500} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity>
                    <ChevronRight size={18} color={colors.slate400} />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        />
        {filteredData.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No registrations found matching your criteria.</Text>
          </View>
        )}
      </View>

      {/* Manual Registration Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manual Registration</Text>
              <Text style={styles.modalSubtitle}>Enter details for a new renter application manually.</Text>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {isFingerprinting ? (
                <View style={styles.scannerContainer}>
                  <View style={styles.scannerHexagon}>
                    <Fingerprint size={64} color={colors.primary} />
                    <View style={[styles.scannerScanline, { top: `${fingerprintProgress}%` }]} />
                  </View>
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Text style={styles.scannerStatus}>Scanning Fingerprint...</Text>
                    <Text style={[styles.userEmail, { color: colors.primary, fontWeight: 'bold' }]}>
                      SCAN {scanCount} OF 3
                    </Text>
                  </View>
                  
                  <View style={styles.scanIndicatorRow}>
                    {[1, 2, 3].map(i => (
                      <View 
                        key={i} 
                        style={[
                          styles.scanDot, 
                          i < scanCount ? styles.scanDotDone : 
                          i === scanCount ? styles.scanDotActive : {}
                        ]} 
                      />
                    ))}
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${fingerprintProgress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{fingerprintProgress}% Complete</Text>
                </View>
              ) : (
                <>
                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>First Name *</Text>
                      <TextInput 
                        style={styles.modalInput}
                        placeholder="e.g. John"
                        placeholderTextColor={colors.slate500}
                        value={formData.firstName}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, firstName: val }))}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Last Name *</Text>
                      <TextInput 
                        style={styles.modalInput}
                        placeholder="e.g. Doe"
                        placeholderTextColor={colors.slate500}
                        value={formData.lastName}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, lastName: val }))}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address *</Text>
                    <TextInput 
                      style={styles.modalInput}
                      placeholder="name@example.com"
                      placeholderTextColor={colors.slate500}
                      keyboardType="email-address"
                      value={formData.email}
                      onChangeText={(val) => setFormData(prev => ({ ...prev, email: val }))}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Student's Contact Number</Text>
                      <TextInput 
                        style={styles.modalInput}
                        placeholder="+33 (000) 000-0000"
                        placeholderTextColor={colors.slate500}
                        keyboardType="phone-pad"
                        value={formData.studentPhone}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, studentPhone: val }))}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Parent's Contact No</Text>
                      <TextInput 
                        style={styles.modalInput}
                        placeholder="+33 (000) 000-0000"
                        placeholderTextColor={colors.slate500}
                        keyboardType="phone-pad"
                        value={formData.parentPhone}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, parentPhone: val }))}
                      />
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Room No *</Text>
                      <TextInput 
                        style={styles.modalInput}
                        placeholder="Room #"
                        placeholderTextColor={colors.slate500}
                        value={formData.roomNo}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, roomNo: val }))}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Floor Number</Text>
                      <TextInput 
                        style={styles.modalInput}
                        placeholder="Floor #"
                        placeholderTextColor={colors.slate500}
                        value={formData.floorNo}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, floorNo: val }))}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>IMD</Text>
                    <TextInput 
                      style={styles.modalInput}
                      placeholder="IMD Identifier"
                      placeholderTextColor={colors.slate500}
                      value={formData.imd}
                      onChangeText={(val) => setFormData(prev => ({ ...prev, imd: val }))}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Biometric Enrollment Status</Text>
                    <TouchableOpacity 
                      style={[styles.fingerprintButton, formData.hasFingerprint && styles.fingerprintButtonActive]}
                      onPress={startFingerprintScan}
                    >
                      <Fingerprint size={20} color={formData.hasFingerprint ? colors.white : colors.primary} />
                      <Text style={[styles.fingerprintButtonText, formData.hasFingerprint && styles.fingerprintButtonTextActive]}>
                        {formData.hasFingerprint ? 'Fingerprint Captured' : 'Register Fingerprint'}
                      </Text>
                      {formData.hasFingerprint && <CheckCircle size={16} color={colors.white} />}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setIsModalVisible(false);
                  setIsFingerprinting(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, isFingerprinting && { opacity: 0.5 }]}
                onPress={handleAddRegistration}
                disabled={isFingerprinting}
              >
                <Text style={styles.submitButtonText}>Add Registration</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};
export const ActiveRenters = () => {
  const [search, setSearch] = useState('');
  
  const filteredData = useMemo(() => {
    return MOCK_ACTIVE_RENTERS.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.unit.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Active Renters</Text>
          <Text style={styles.subtitle}>Real-time oversight of all authorized personnel currently on-site.</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Clock size={18} color={colors.white} />
          <Text style={styles.addButtonText}>Export Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.indigo50 }]}>
            <Search size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>1,284</Text>
            <Text style={styles.statLabel}>Total Active Renters</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.08)' }]}>
            <Clock size={22} color={colors.amber600} />
          </View>
          <View>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Currently On-site</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <CheckCircle size={20} color="#10B981" />
          </View>
          <View>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </View>
        </View>
      </View>

      <View style={styles.filtersRow}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.slate400} />
          <TextInput 
            placeholder="Search active renters..." 
            placeholderTextColor={colors.slate400}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.tableCard}>
        <Table 
          headers={['Renter', 'Unit', 'Access Level', 'Last Entry', 'Status']}
          data={filteredData}
          renderRow={(item) => (
            <>
              <View style={[styles.cell, { flex: 1.5, flexDirection: 'row', gap: 12 }]}>
                <View style={[styles.avatar, { backgroundColor: colors.slate800 }]}>
                  <Text style={styles.avatarText}>{item.initials}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
              </View>
              <View style={styles.cell}>
                <Text style={styles.unitText}>{item.unit}</Text>
              </View>
              <View style={styles.cell}>
                <View style={[styles.statusBadge, { backgroundColor: item.level === 'VIP' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(17, 50, 212, 0.1)', borderColor: item.level === 'VIP' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(17, 50, 212, 0.2)' }]}>
                  <Text style={[styles.statusBadgeText, { color: item.level === 'VIP' ? '#F59E0B' : colors.primary }]}>{item.level}</Text>
                </View>
              </View>
              <View style={styles.cell}>
                <Text style={styles.dateText}>{item.time}</Text>
              </View>
              <View style={styles.cell}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
                  <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>Active</Text>
                </View>
              </View>
            </>
          )}
        />
      </View>
    </View>
  );
};

export const AccessLogs = () => {
  const [search, setSearch] = useState('');
  
  const filteredData = useMemo(() => {
    return MOCK_ACCESS_LOGS.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.point.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Access Logs</Text>
          <Text style={styles.subtitle}>Real-time monitoring of entry points and security credentials.</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Filter size={18} color={colors.white} />
          <Text style={styles.addButtonText}>Refresh Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(17, 50, 212, 0.1)' }]}>
            <Clock size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>2,841</Text>
            <Text style={styles.statLabel}>Access Requests</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <XCircle size={20} color={colors.rose500} />
          </View>
          <View>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Denied Attempts</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <CheckCircle size={20} color="#10B981" />
          </View>
          <View>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Active Endpoints</Text>
          </View>
        </View>
      </View>

      <View style={styles.filtersRow}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.slate400} />
          <TextInput 
            placeholder="Search access logs..." 
            placeholderTextColor={colors.slate400}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.tableCard}>
        <Table 
          headers={['Timestamp', 'User', 'Access Point', 'Method', 'Status']}
          data={filteredData}
          renderRow={(item) => (
            <>
              <View style={styles.cell}>
                <Text style={styles.unitText}>{item.time}</Text>
              </View>
              <View style={[styles.cell, { flex: 1.2, flexDirection: 'row', gap: 10 }]}>
                {item.avatar ? (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.initials}</Text>
                  </View>
                ) : (
                  <View style={[styles.avatar, { backgroundColor: colors.slate800 }]}>
                    <XCircle size={14} color={colors.slate400} />
                  </View>
                )}
                <View>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.dept}</Text>
                </View>
              </View>
              <View style={styles.cell}>
                <Text style={styles.unitText}>{item.point}</Text>
              </View>
              <View style={styles.cell}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {item.type === 'Biometric Scan' ? <Fingerprint size={14} color={colors.primary} /> : <Smartphone size={14} color={colors.slate400} />}
                  <Text style={styles.unitText}>{item.type}</Text>
                </View>
              </View>
              <View style={styles.cell}>
                <View style={[styles.statusBadge, item.status === 'Granted' ? styles.approvedBadge : styles.rejectedBadge]}>
                  <Text style={[styles.statusBadgeText, item.status === 'Granted' ? styles.approvedText : styles.rejectedText]}>{item.status}</Text>
                </View>
              </View>
            </>
          )}
        />
      </View>
    </View>
  );
};

export const AuditLogs = () => {
  const [search, setSearch] = useState('');
  
  const filteredData = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter(item => 
      item.admin.toLowerCase().includes(search.toLowerCase()) || 
      item.details.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Audit Logs</Text>
          <Text style={styles.subtitle}>Comprehensive trail of all administrative actions and system modifications.</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Database size={18} color={colors.white} />
          <Text style={styles.addButtonText}>Download Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersRow}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.slate400} />
          <TextInput 
            placeholder="Search audit trail..." 
            placeholderTextColor={colors.slate400}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.tableCard}>
        <Table 
          headers={['Administrator', 'Action Type', 'Details', 'Timestamp', 'Status']}
          data={filteredData}
          renderRow={(item) => (
            <>
              <View style={[styles.cell, { flex: 1.2, flexDirection: 'row', gap: 12 }]}>
                <View style={[styles.avatar, { backgroundColor: colors.slate800 }]}>
                  <Text style={styles.avatarText}>{item.initials}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>{item.admin}</Text>
                  <Text style={styles.userEmail}>{item.adminId}</Text>
                </View>
              </View>
              <View style={styles.cell}>
                <Text style={styles.unitText}>{item.type}</Text>
              </View>
              <View style={[styles.cell, { flex: 1.5 }]}>
                <Text style={styles.userName}>{item.details}</Text>
                <Text style={styles.userEmail}>{item.subDetails}</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.unitText}>{item.time}</Text>
                <Text style={styles.userEmail}>{item.date}</Text>
              </View>
              <View style={styles.cell}>
                <View style={[styles.statusBadge, item.status === 'Success' ? styles.approvedBadge : styles.rejectedBadge]}>
                  <Text style={[styles.statusBadgeText, item.status === 'Success' ? styles.approvedText : styles.rejectedText]}>{item.status}</Text>
                </View>
              </View>
            </>
          )}
        />
      </View>
    </View>
  );
};

export const Permissions = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Roles & Permissions</Text>
        <Text style={styles.subtitle}>Define access levels and assign security roles to system users.</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <ShieldCheck size={18} color={colors.white} />
        <Text style={styles.addButtonText}>Create New Role</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.tableCard}>
      <Table 
        headers={['Role Name', 'Assigned Users', 'Access Level', 'Last Modified', 'Status']}
        data={MOCK_PERMISSIONS}
        renderRow={(item) => (
          <>
            <View style={styles.cell}>
              <Text style={styles.userName}>{item.role}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.unitText}>{item.users} Users</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.unitText}>{item.level}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.userEmail}>{item.lastUpdated}</Text>
            </View>
            <View style={styles.cell}>
              <View style={[styles.statusBadge, item.status === 'Critical' ? styles.rejectedBadge : styles.pendingBadge]}>
                <Text style={[styles.statusBadgeText, item.status === 'Critical' ? styles.rejectedText : styles.pendingText]}>{item.status}</Text>
              </View>
            </View>
          </>
        )}
      />
    </View>
  </View>
);

export const SystemHealth = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>System Health</Text>
        <Text style={styles.subtitle}>Infrastructure status and performance metrics for the SecureAccess network.</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Activity size={18} color={colors.white} />
        <Text style={styles.addButtonText}>View Network Map</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.statsRow}>
      {MOCK_SYSTEM_HEALTH.slice(0, 3).map(item => (
        <View key={item.id} style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: `${item.statusColor}20` }]}>
            <Activity size={20} color={item.statusColor} />
          </View>
          <View>
            <Text style={styles.statValue}>{item.uptime}</Text>
            <Text style={styles.statLabel}>{item.component}</Text>
          </View>
        </View>
      ))}
    </View>

    <View style={styles.tableCard}>
      <Table 
        headers={['Component', 'Status', 'Latency', 'Load', 'Uptime']}
        data={MOCK_SYSTEM_HEALTH}
        renderRow={(item) => (
          <>
            <View style={styles.cell}>
              <Text style={styles.userName}>{item.component}</Text>
            </View>
            <View style={styles.cell}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.statusColor }} />
                <Text style={[styles.statusBadgeText, { color: item.statusColor }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.cell}>
              <Text style={styles.unitText}>{item.latency}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.unitText}>{item.load}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.unitText}>{item.uptime}</Text>
            </View>
          </>
        )}
      />
    </View>
  </View>
);

export const Configuration = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>System Configuration</Text>
        <Text style={styles.subtitle}>Fine-tune security protocols and global application settings.</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Cpu size={18} color={colors.white} />
        <Text style={styles.addButtonText}>Export Config</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.tableCard}>
      <Table 
        headers={['Setting Name', 'Current Value', 'Category', 'Last Changed', 'Actions']}
        data={MOCK_CONFIG}
        renderRow={(item) => (
          <>
            <View style={styles.cell}>
              <Text style={styles.userName}>{item.key}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={[styles.unitText, { fontWeight: '700' }]}>{item.value}</Text>
            </View>
            <View style={styles.cell}>
              <View style={[styles.statusBadge, styles.pendingBadge]}>
                <Text style={[styles.statusBadgeText, styles.pendingText]}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.cell}>
              <Text style={styles.userEmail}>{item.lastChanged}</Text>
            </View>
            <TouchableOpacity style={[styles.cell, { alignItems: 'flex-end', paddingRight: 20 }]}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Modify</Text>
            </TouchableOpacity>
          </>
        )}
      />
    </View>
  </View>
);

export const DeviceManagement = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Device Management</Text>
        <Text style={styles.subtitle}>Inventory and control of all connected hardware terminals.</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Cpu size={18} color={colors.white} />
        <Text style={styles.addButtonText}>Register Device</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.tableCard}>
      <Table 
        headers={['Device Name', 'Technical Type', 'IP Address', 'Status', 'Health']}
        data={MOCK_DEVICES}
        renderRow={(item) => (
          <>
            <View style={styles.cell}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>ID: {item.id}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.unitText}>{item.type}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.userEmail}>{item.ip}</Text>
            </View>
            <View style={styles.cell}>
              <View style={[styles.statusBadge, item.status === 'Online' ? styles.approvedBadge : styles.rejectedBadge]}>
                <Text style={[styles.statusBadgeText, item.status === 'Online' ? styles.approvedText : styles.rejectedText]}>{item.status}</Text>
              </View>
            </View>
            <View style={[styles.cell, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
              <View style={{ flex: 1, height: 4, backgroundColor: colors.slate200, borderRadius: 2 }}>
                <View style={{ width: `${item.health}%`, height: 4, backgroundColor: item.health > 80 ? colors.emerald500 : item.health > 50 ? colors.amber500 : colors.rose500, borderRadius: 2 }} />
              </View>
              <Text style={[styles.tinyText, { minWidth: 25 }]}>{item.health}%</Text>
            </View>
          </>
        )}
      />
    </View>
  </View>
);

export const FingerprintUI = () => <SkeletonScreen title="Fingerprint Recognition" subtitle="Visual interface for multi-spectral biometric scanning operations." />;
export const AdminInteractive = () => <SkeletonScreen title="Admin Interactive" subtitle="Command-line interface for complex system overrides and debugging." />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', color: colors.slate900, fontFamily: 'PublicSans-Black', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.slate500, marginTop: 6, fontFamily: 'PublicSans-Regular', lineHeight: 22 },
  addButton: { 
    backgroundColor: colors.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0px 4px 8px rgba(17, 50, 212, 0.2)' },
      default: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }
    })
  },
  addButtonText: { color: colors.white, fontWeight: '800', fontSize: 15, fontFamily: 'PublicSans-Bold' },
  statsRow: { flexDirection: 'row', gap: 20, marginBottom: 32 },
  statCard: { 
    flex: 1, 
    backgroundColor: colors.white, 
    padding: 20, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    borderWidth: 1, 
    borderColor: colors.slate100,
    ...Platform.select({
      web: { boxShadow: '0px 2px 10px rgba(15, 23, 42, 0.05)' },
      default: { shadowColor: colors.slate900, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }
    })
  },
  statIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 24, fontWeight: '900', color: colors.slate900, fontFamily: 'PublicSans-Black' },
  statLabel: { fontSize: 13, color: colors.slate500, fontFamily: 'PublicSans-Regular', marginTop: 2 },
  filtersRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  tabs: { flexDirection: 'row', gap: 10, backgroundColor: colors.slate100, padding: 4, borderRadius: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  activeTab: { 
    backgroundColor: colors.white,
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.1)' },
      default: { shadowColor: colors.slate900, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }
    })
  },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.slate500, fontFamily: 'PublicSans-Bold' },
  activeTabText: { color: colors.primary },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, paddingHorizontal: 16, borderRadius: 12, minWidth: 420, height: 48, borderWidth: 1, borderColor: colors.slate200 },
  searchInput: { 
    flex: 1, 
    height: '100%',
    fontSize: 15, 
    color: colors.slate900, 
    fontFamily: 'PublicSans-Regular',
    ...Platform.select({
      web: { outlineWidth: 0 },
      default: {}
    })
  },
  tableCard: { 
    backgroundColor: colors.white, 
    borderRadius: 16, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: colors.slate100,
    ...Platform.select({
      web: { boxShadow: '0px 4px 15px rgba(15, 23, 42, 0.03)' },
      default: { shadowColor: colors.slate900, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 15, elevation: 2 }
    })
  },
  cell: { flex: 1, justifyContent: 'center', paddingVertical: 16 },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.indigo50, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary, fontSize: 14, fontWeight: '800', fontFamily: 'PublicSans-Black' },
  userName: { fontSize: 15, fontWeight: '700', color: colors.slate900, fontFamily: 'PublicSans-Bold' },
  userEmail: { fontSize: 13, color: colors.slate500, fontFamily: 'PublicSans-Regular', marginTop: 2 },
  unitText: { fontSize: 14, color: colors.slate700, fontFamily: 'PublicSans-Medium' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  statusBadgeText: { fontSize: 12, fontWeight: '800', fontFamily: 'PublicSans-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  pendingBadge: { backgroundColor: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.2)' },
  pendingText: { color: colors.amber600 },
  approvedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)' },
  approvedText: { color: colors.emerald600 },
  rejectedBadge: { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' },
  rejectedText: { color: colors.rose600 },
  dateText: { fontSize: 13, color: colors.slate500, fontFamily: 'PublicSans-Regular' },
  actionsCell: { flexDirection: 'row', gap: 16, alignItems: 'center', flex: 0.5 },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyStateText: { color: colors.slate400, fontSize: 15, fontFamily: 'PublicSans-Regular' },
  placeholder: { flex: 1, backgroundColor: colors.slate50, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.slate200, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  placeholderText: { color: colors.slate400, fontSize: 16, fontFamily: 'PublicSans-Regular' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { 
    backgroundColor: colors.white, 
    width: '100%', 
    maxWidth: 680, 
    borderRadius: 24,
    ...Platform.select({
      web: { boxShadow: '0px 20px 30px rgba(0, 0, 0, 0.1)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 10 }
    })
  },
  modalHeader: { padding: 32, borderBottomWidth: 1, borderBottomColor: colors.slate100 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: colors.slate900, fontFamily: 'PublicSans-Black' },
  modalSubtitle: { fontSize: 15, color: colors.slate500, marginTop: 8, fontFamily: 'PublicSans-Regular' },
  modalBody: { padding: 32, maxHeight: 600 },
  inputRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  inputGroup: { gap: 10, marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '800', color: colors.slate700, fontFamily: 'PublicSans-Bold' },
  modalInput: { 
    backgroundColor: colors.slate50, 
    borderWidth: 1, 
    borderColor: colors.slate200, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 15, 
    color: colors.slate900, 
    fontFamily: 'PublicSans-Regular',
    ...Platform.select({
      web: { outlineWidth: 0 },
      default: {}
    })
  },
  fingerprintButton: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.indigo50, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, padding: 20, borderStyle: 'dashed' },
  fingerprintButtonActive: { backgroundColor: colors.primary, borderStyle: 'solid' },
  fingerprintButtonText: { color: colors.primary, fontWeight: '800', fontSize: 15, flex: 1, fontFamily: 'PublicSans-Bold' },
  fingerprintButtonTextActive: { color: colors.white },
  modalFooter: { padding: 32, borderTopWidth: 1, borderTopColor: colors.slate100, flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  cancelButton: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  cancelButtonText: { color: colors.slate500, fontWeight: '700', fontSize: 15, fontFamily: 'PublicSans-Bold' },
  submitButton: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 32, 
    paddingVertical: 14, 
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0px 4px 8px rgba(17, 50, 212, 0.3)' },
      default: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }
    })
  },
  submitButtonText: { color: colors.white, fontWeight: '900', fontSize: 15, fontFamily: 'PublicSans-Black' },
  scannerContainer: { alignItems: 'center', paddingVertical: 40, gap: 24 },
  scannerHexagon: { width: 160, height: 160, borderRadius: 80, backgroundColor: colors.indigo50, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.primary, position: 'relative', overflow: 'hidden' },
  scannerScanline: { position: 'absolute', width: '100%', height: 3, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5 },
  scannerStatus: { fontSize: 20, fontWeight: '900', color: colors.slate900, marginTop: 12, fontFamily: 'PublicSans-Black' },
  progressContainer: { width: '80%', height: 8, backgroundColor: colors.slate100, borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: colors.primary },
  progressText: { fontSize: 14, color: colors.slate500, fontWeight: '800', fontFamily: 'PublicSans-Bold' },
  scanIndicatorRow: { flexDirection: 'row', gap: 16 },
  scanDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.slate200 },
  scanDotActive: { backgroundColor: colors.primary, transform: [{ scale: 1.3 }] },
  scanDotDone: { backgroundColor: colors.emerald500 },
  tinyText: { fontSize: 11, color: colors.slate500, fontFamily: 'PublicSans-Regular' }
});

