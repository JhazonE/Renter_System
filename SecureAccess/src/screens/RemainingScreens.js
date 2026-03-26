import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, Animated, Easing } from 'react-native';
import * as Print from 'expo-print';
import { 
  Text, 
  Button, 
  TextInput, 
  IconButton, 
  Card, 
  Avatar, 
  DataTable, 
  Portal, 
  Modal, 
  Menu,
  Divider,
  Dialog,
  SegmentedButtons, 
  ActivityIndicator, 
  useTheme,
  Surface,
  ProgressBar,
  Switch
} from 'react-native-paper';
import axios from 'axios';
import { colors } from '../theme/colors';
import { Table } from '../components/Table';
import { BiometricTerminal } from './BiometricTerminal';
import { usePermissions } from '../context/PermissionContext';
import { BiometricService } from '../utils/biometric';
import { PERMISSIONS, ROLE_PERMISSIONS, ROLES } from '../utils/permissions';

import { API_BASE_URL } from '../utils/api';
import { createAuditLog } from '../utils/audit';

const API_URL = `${API_BASE_URL}/registrations`; 

const SkeletonScreen = ({ title, subtitle }) => {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>{title}</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>{subtitle}</Text>
      <Surface style={styles.placeholder} elevation={1}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.placeholderText}>
          Implementation of {title} in progress...
        </Text>
      </Surface>
    </View>
  );
};

const MOCK_REGISTRATIONS = [
  { id: '1', name: 'Alex Rivera', email: 'alex.r@enterprise.com', unit: 'Unit 402', level: 'VIP', time: '10:42 AM', initials: 'AR', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA69nSUmovo6-HW6dCUTtgmjT955EF1cXEPjDvODJBTmuElCi4btf4JIawfcLiO60LJwQ0QF92DgHhOxP2nDpAgo9MZTCs04vPN2vsIDMvS4Fn0hsNIm__8XsYmjDNINGmh4xR1ZL8wXw6U7cGebUbA2Q_32Sh8BRjZWbi8Jc27Nr4NIyiqwLFKbn7u0oQzdKyHQ8cZsdAgReR3h12DQzMHA-rJwfjo8HO-UukNhk3KKYSb9DfLu8HeH5wpCs8ccKRN0t_URWii8tC5', status: 'Pending', date: '2023-11-24', hasFingerprint: true },
  { id: '2', name: 'Jordan Smith', email: 'jsmith_42@gmail.com', unit: 'Suite 12', level: 'Standard', time: '09:15 AM', initials: 'JS', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhI39moDeXEs1CgHm0O-UKdU4VjiJN2PVU2osp5r9qpw9EHS_SR6I8w1XMVz7z98QEgh0QzehYabUNmafUr6XA2dGGSU5BssSRIcVXkh4lMtlbje4VArfaCHuMYHZQzs7mcnKPQNilMirZhCJOU5yb_O5Ezk8XO_TbbQVKU00C4rwZwuGYKC0qhqUy_Z2TPMChmLRWrmBj1d2EDzo30y7XYmDXSULxZZqhOwX16SZ1ZYgnxC5JJExnP8TgdOwEerFkKyjwIF6tZin2', status: 'Approved', date: '2023-11-23', hasFingerprint: false },
  { id: '3', name: 'Casey Chen', email: 'labs.maintenance@facility.io', unit: 'Main Lab', level: 'Maintenance', time: '08:30 AM', initials: 'CC', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgK36s7ERHb11ZUBUbz1_AjVAQNRiJHVEbW_d6ei0U3fLTJqHgFtLhxlzfBQrdm8ytl1b6j5gzhKJsxagktA5qeqzCfP5d2gqwt1VwiBGZY9YVdKVeJ5UPxDUYxFEkxOm17D_qQgN_TUJ8lAIhTpofRCGbKBvsGAgfQDY5HXJn3T7dXb7Pr4sB5VPimw9VdiqaOo4HLM-h1CYN98XQYoqZ_CnKp-c2vJhJMa3EStwjQSd9y8hMCvz7kgWWL3A5s2GcVQ4A1ZTZ2-t5', status: 'Pending', date: '2023-11-22', hasFingerprint: true },
  { id: '4', name: 'Morgan Taylor', email: 'm.taylor@skyline.res', unit: 'Unit 105', level: 'Standard', time: '11:15 PM', initials: 'MT', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8qQJdZdNSeDomXBHD5rwpPiw-2iAMY2cHskcop4mWcDg6eD4NzUS0mE4TpkvYFLv5musEKiouslfVrEKEDahBMzla0G4sF4SXCabRMWvqltj_I1zzyuYJdZJGTpV0Yo98iaxAJcsAh77LEIxCCu-Is6l4BI65AdomUDGe2iSgc1DUGRhhqSMBQSUfUQsRM5XKxOluH4oK0j5SI0ue6nEmF7lq2MDyh8zvKrUIFpJVbB7xbh8G5kO035gmFWLqeSNjpmMG7BaMCRRY', status: 'Approved', date: '2023-11-21', hasFingerprint: false },
  { id: '5', name: 'Riley Webb', email: 'r.webb@proton.me', unit: 'Unit 303', level: 'VIP', time: '2 days ago', initials: 'RW', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvBdtRA8ab0zLqdNfFNRUvlEmu0WzYUbrL8DqTiLXwYJMtvDrPycctiBj-rm56p_J7bagR4NF0maaZovc2yP5a92sYkpdh8fEP2TUHtkXPAlHH7Y3EZvpXdo2Sh8QEZhuOA2wGFk_qnN7COx219C227-lg2a-O5Detw7GL-Gt5ex43Twa_lGOvrPLkIiAF7ZMNQV0nAOAKG6O3wEXaXghVjIfNhGNs6ar4Dj6DKT0m_pjXkcjhZVflCEc-uZsN_wP0PKexuwzbCFPV2', status: 'Rejected', date: '2023-11-20', hasFingerprint: true },
];

const MOCK_ACTIVE_RENTERS = [
  { id: '1', name: 'Alex Rivera', email: 'alex.r@enterprise.com', unit: 'Unit 402', level: 'VIP', time: '10:42 AM', initials: 'AR', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA69nSUmovo6-HW6dCUTtgmjT955EF1cXEPjDvODJBTmuElCi4btf4JIawfcLiO60LJwQ0QF92DgHhOxP2nDpAgo9MZTCs04vPN2vsIDMvS4Fn0hsNIm__8XsYmjDNINGmh4xR1ZL8wXw6U7cGebUbA2Q_32Sh8BRjZWbi8Jc27Nr4NIyiqwLFKbn7u0oQzdKyHQ8cZsdAgReR3h12DQzMHA-rJwfjo8HO-UukNhk3KKYSb9DfLu8HeH5wpCs8ccKRN0t_URWii8tC5' },
  { id: '2', name: 'Jordan Smith', email: 'jsmith_42@gmail.com', unit: 'Suite 12', level: 'Standard', time: '09:15 AM', initials: 'JS', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhI39moDeXEs1CgHm0O-UKdU4VjiJN2PVU2osp5r9qpw9EHS_SR6I8w1XMVz7z98QEgh0QzehYabUNmafUr6XA2dGGSU5BssSRIcVXkh4lMtlbje4VArfaCHuMYHZQzs7mcnKPQNilMirZhCJOU5yb_O5Ezk8XO_TbbQVKU00C4rwZwuGYKC0qhqUy_Z2TPMChmLRWrmBj1d2EDzo30y7XYmDXSULxZZqhOwX16SZ1ZYgnxC5JJExnP8TgdOwEerFkKyjwIF6tZin2' },
  { id: '3', name: 'Casey Chen', email: 'labs.maintenance@facility.io', unit: 'Main Lab', level: 'Maintenance', time: '08:30 AM', initials: 'CC', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgK36s7ERHb11ZUBUbz1_AjVAQNRiJHVEbW_d6ei0U3fLTJqHgFtLhxlzfBQrdm8ytl1b6j5gzhKJsxagktA5qeqzCfP5d2gqwt1VwiBGZY9YVdKVeJ5UPxDUYxFEkxOm17D_qQgN_TUJ8lAIhTpofRCGbKBvsGAgfQDY5HXJn3T7dXb7Pr4sB5VPimw9VdiqaOo4HLM-h1CYN98XQYoqZ_CnKp-c2vJhJMa3EStwjQSd9y8hMCvz7kgWWL3A5s2GcVQ4A1ZTZ2-t5' },
  { id: '4', name: 'Morgan Taylor', email: 'm.taylor@skyline.res', unit: 'Unit 105', level: 'Standard', time: '11:15 PM', initials: 'MT', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8qQJdZdNSeDomXBHD5rwpPiw-2iAMY2cHskcop4mWcDg6eD4NzUS0mE4TpkvYFLv5musEKiouslfVrEKEDahBMzla0G4sF4SXCabRMWvqltj_I1zzyuYJdZJGTpV0Yo98iaxAJcsAh77LEIxCCu-Is6l4BI65AdomUDGe2iSgc1DUGRhhqSMBQSUfUQsRM5XKxOluH4oK0j5SI0ue6nEmF7lq2MDyh8zvKrUIFpJVbB7xbh8G5kO035gmFWLqeSNjpmMG7BaMCRRY' },
  { id: '5', name: 'Riley Webb', email: 'r.webb@proton.me', unit: 'Unit 303', level: 'VIP', time: '2 days ago', initials: 'RW', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvBdtRA8ab0zLqdXFNRUvlEmu0WzYUbrL8DqTiLXwYJMtvDrPycctiBj-rm56p_J7bagR4NF0maaZovc2yP5a92sYkpdh8fEP2TUHtkXPAlHH7Y3EZvpXdo2Sh8QEZhuOA2wGFk_qnN7COx219C227-lg2a-O5Detw7GL-Gt5ex43Twa_lGOvrPLkIiAF7ZMNQV0nAOAKG6O3wEXaXghVjIfNhGNs6ar4Dj6DKT0m_pjXkcjhZVflCEc-uZsN_wP0PKexuwzbCFPV2' },
];



const MOCK_PERMISSIONS = [
  { id: '1', role: 'Super Admin', users: 3, level: 'Full Access', lastUpdated: '2 days ago', status: 'Critical' },
  { id: '2', role: 'Security Officer', users: 12, level: 'Restricted', lastUpdated: '1 week ago', status: 'Active' },
  { id: '3', role: 'Facility Manager', users: 5, level: 'View Only', lastUpdated: '3 weeks ago', status: 'Active' },
  { id: '4', role: 'External Auditor', users: 2, level: 'Audit Only', lastUpdated: '1 month ago', status: 'Temporary' },
];




export const Registrations = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState('table');
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const theme = useTheme();

  
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
    hasFingerprint: false,
    biometricTemplate: null 
  });
  const { userRole, isAuthenticated } = usePermissions();
  const [isFingerprinting, setIsFingerprinting] = useState(false);
  const [fingerprintProgress, setFingerprintProgress] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated, userRole]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        headers: {
          'x-user-role': userRole
        }
      });
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
    active: data.filter(r => r.status === 'Approved').length,
  }), [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const name = item.name || `${item.first_name} ${item.last_name}`;
      return name.toLowerCase().includes(search.toLowerCase()) || 
             item.email.toLowerCase().includes(search.toLowerCase());
    });
  }, [data, search]);



  const handleEditPress = (item) => {
    setEditId(item.id);
    setIsEditing(true);
    setIsViewing(false);
    setFormData({
      firstName: item.firstName || item.first_name || '',
      lastName: item.lastName || item.last_name || '',
      email: item.email || '',
      studentPhone: item.studentPhone || item.student_phone || '',
      parentPhone: item.parentPhone || item.parent_phone || '',
      roomNo: item.roomNo || item.room_no || '',
      floorNo: item.floorNo || item.floor_no || '',
      imd: item.imd || '',
      hasFingerprint: item.hasFingerprint || item.has_fingerprint || false,
      biometricTemplate: item.biometricTemplate || item.biometric_template || null
    });
    setIsModalVisible(true);
  };

  const handleDeleteRegistration = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const renterToDelete = data.find(r => r.id === deleteTarget.id);
      await axios.delete(`${API_URL}/${deleteTarget.id}`);
      setData(prev => prev.filter(r => r.id !== deleteTarget.id));
      
      await createAuditLog({
        admin: userRole,
        adminId: userRole,
        type: 'Renter Deletion',
        details: `Deleted renter: ${renterToDelete?.firstName} ${renterToDelete?.lastName}`,
        subDetails: `Unit: ${renterToDelete?.unit || `Room ${renterToDelete?.roomNo}`}`,
        status: 'Success'
      });
    } catch (error) {
      console.error('Error deleting registration:', error);
      Alert.alert('Error', 'Failed to delete registration from database.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleViewDetails = (item) => {
    setEditId(item.id);
    setIsEditing(false);
    setIsViewing(true);
    setFormData({
      firstName: item.firstName || item.first_name || '',
      lastName: item.lastName || item.last_name || '',
      email: item.email || '',
      studentPhone: item.studentPhone || item.student_phone || '',
      parentPhone: item.parentPhone || item.parent_phone || '',
      roomNo: item.roomNo || item.room_no || '',
      floorNo: item.floorNo || item.floor_no || '',
      imd: item.imd || '',
      hasFingerprint: item.hasFingerprint || item.has_fingerprint || false,
      biometricTemplate: item.biometricTemplate || item.biometric_template || null
    });
    setIsModalVisible(true);
  };

  const handleSaveRegistration = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.roomNo) {
      Alert.alert('Validation Error', 'Please fill in all required fields (First Name, Last Name, Email, Room No)');
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`;
    const initials = (formData.firstName[0] || '') + (formData.lastName[0] || '');

    const entryData = {
      ...formData,
      name: fullName,
      unit: `Room ${formData.roomNo}`,
      initials: initials.toUpperCase()
    };

    console.log(`Saving registration. isEditing: ${isEditing}, editId: ${editId}`, entryData);

    try {
      if (isEditing) {
        console.log(`Sending PUT request to ${API_URL}/${editId}`);
        const response = await axios.put(`${API_URL}/${editId}`, entryData);
        console.log('Update response:', response.data);
        setData(prev => prev.map(item => item.id === editId ? response.data : item));
        
        await createAuditLog({
          admin: userRole,
          adminId: userRole,
          type: 'Renter Update',
          details: `Updated renter: ${formData.firstName} ${formData.lastName}`,
          subDetails: `Unit: ${entryData.unit}`,
          status: 'Success'
        });
      } else {
        console.log(`Sending POST request to ${API_URL}`);
        const response = await axios.post(API_URL, { ...entryData, status: 'Approved' });
        console.log('Create response:', response.data);
        setData(prev => [response.data, ...prev]);

        // Log registration approval dynamically
        try {
          await axios.post('http://localhost:5000/api/access-logs', {
            name: entryData.name,
            dept: 'New Registration',
            point: 'Admin Console',
            location: 'Front Desk',
            type: 'System Enrollment',
            status: 'Granted',
            avatar: null
          });
        } catch (logErr) {
          console.error('Failed to log registration approval', logErr);
        }

        await createAuditLog({
          admin: userRole, // Name not easily available here, using role
          adminId: userRole,
          type: 'Renter Registration',
          details: `Registered new renter: ${formData.firstName} ${formData.lastName}`,
          subDetails: `Unit: ${entryData.unit}`,
          status: 'Success'
        });
      }
      
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving registration:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'save'} registration to database.`);
    }
  };

  const resetForm = () => {
    setFormData({ 
      firstName: '', 
      lastName: '', 
      email: '', 
      studentPhone: '', 
      parentPhone: '', 
      roomNo: '', 
      floorNo: '', 
      imd: '',
      floorNo: '', 
      imd: '',
      hasFingerprint: false,
      biometricTemplate: null 
    });
    setIsEditing(false);
    setIsViewing(false);
    setEditId(null);
  };

  const startFingerprintScan = async () => {
    setIsFingerprinting(true);
    setFingerprintProgress(0);
    setScanCount(1);
    
    try {
      // 1. Check if the Biometric Service is running
      const isRunning = await BiometricService.isServiceRunning();
      if (!isRunning) {
        throw new Error('SYSTEM ERROR: BIOMETRIC SERVICE NOT DETECTED. PLEASE ENSURE DIGITAL PERSONA WEB COMPONENTS ARE INSTALLED AND RUNNING.');
      }

      // 2. Start visual feedback
      runScan(1);

      // 3. Trigger real hardware capture via SDK
      console.log('Initiating SDK enrollment capture...');
      const captureResult = await BiometricService.capture();
      
      if (captureResult.status === 'SUCCESS') {
        console.log('SDK Enrollment Capture Success');
        setFingerprintProgress(100);
        setFormData(prev => ({ 
          ...prev, 
          hasFingerprint: true, 
          biometricTemplate: captureResult.template 
        }));
        setScanCount(0);
        setTimeout(() => setIsFingerprinting(false), 800);
      }
    } catch (err) {
      console.error('Biometric Enrollment Failed:', err);
      let errorMsg = err.message || 'Capture failed';
      
      if (errorMsg.includes('DETECTED') || errorMsg.includes('unreachable') || errorMsg.includes('refused')) {
        errorMsg = 'BIOMETRIC BRIDGE IS UNREACHABLE. PLEASE ENSURE THE .NET BRIDGE IS RUNNING (dotnet run --project BiometricBridge) OR THE HID WEB SDK IS ACTIVE (VISIT HTTPS://127.0.0.1:52181/GET_CONNECTION).';
      }
      
      Alert.alert('Hardware Error', errorMsg);
      setIsFingerprinting(false);
      setScanCount(0);
    }
  };

  const runScan = (currentScan) => {
    setScanCount(currentScan);
    setFingerprintProgress(0);
    
    // Progress bar visual only
    if (isFingerprinting && currentScan < 3) {
      setTimeout(() => runScan(currentScan + 1), 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineMedium" style={styles.title}>Registrations</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Review and approve new registration requests.</Text>
        </View>
        <Button 
          mode="contained" 
          icon="account-plus" 
          onPress={() => { resetForm(); setIsModalVisible(true); }}
          style={styles.addButton}
        >
          Manual Registration
        </Button>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={44} icon="account-group" style={{ backgroundColor: colors.indigo50 }} color={colors.primary} />
            <View style={{ marginLeft: 16 }}>
              <Text variant="headlineSmall" style={styles.statValue}>{stats.total}</Text>
              <Text variant="labelMedium" style={styles.statLabel}>Total Registrations</Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={44} icon="check-circle-outline" style={{ backgroundColor: "rgba(16, 185, 129, 0.08)" }} color={colors.emerald600} />
            <View style={{ marginLeft: 16 }}>
              <Text variant="headlineSmall" style={styles.statValue}>{stats.active}</Text>
              <Text variant="labelMedium" style={styles.statLabel}>Active Renters</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.filtersRow}>

        
        <TextInput
          placeholder="Search by name or email..."
          value={search}
          onChangeText={setSearch}
          mode="outlined"
          left={<TextInput.Icon icon="magnify" color={colors.slate400} />}
          style={styles.searchBar}
          outlineStyle={{ borderRadius: 12, borderColor: colors.slate200 }}
          contentStyle={{ fontSize: 14 }}
        />

        <View style={styles.viewToggleGroup}>
          <IconButton 
            icon="view-list" 
            mode={viewType === 'table' ? 'contained' : 'standard'}
            containerColor={viewType === 'table' ? colors.primary : 'transparent'}
            iconColor={viewType === 'table' ? colors.white : colors.slate500}
            onPress={() => setViewType('table')}
            size={20}
          />
          <IconButton 
            icon="view-grid" 
            mode={viewType === 'grid' ? 'contained' : 'standard'}
            containerColor={viewType === 'grid' ? colors.primary : 'transparent'}
            iconColor={viewType === 'grid' ? colors.white : colors.slate500}
            onPress={() => setViewType('grid')}
            size={20}
          />
        </View>
      </View>


      <Card style={[styles.tableCard, viewType === 'grid' && { backgroundColor: 'transparent', elevation: 0, borderWidth: 0 }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ marginTop: 16, color: colors.slate500 }}>Loading registrations...</Text>
          </View>
        ) : viewType === 'table' ? (
          <Table 
            headers={['Applicant', 'Student Phone', 'Parent Phone', 'Room', 'Floor', 'IMD', 'Date', 'Actions']}
            columnFlex={[2, 1.6, 1.6, 0.7, 0.7, 0.7, 1.2, 1]}
            data={filteredData}
            renderRow={(item) => (
              <>
                <DataTable.Cell style={{ flex: 2 }}>
                  <View style={styles.userInfo}>
                    <Avatar.Text 
                      size={32} 
                      label={item.initials || (item.name ? item.name.substring(0, 2).toUpperCase() : '??')} 
                      style={styles.avatar}
                      labelStyle={styles.avatarLabel}
                    />
                    <View style={{ marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{item.name || `${item.first_name} ${item.last_name}`}</Text>
                        {item.hasFingerprint && <IconButton icon="fingerprint" size={14} iconColor={colors.primary} style={{ margin: 0, padding: 0 }} />}
                      </View>
                      <Text variant="bodySmall" style={{ color: colors.slate500 }}>{item.email}</Text>
                    </View>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell style={{ flex: 1.6 }}><Text variant="bodySmall">{item.studentPhone || item.student_phone || '-'}</Text></DataTable.Cell>
                <DataTable.Cell style={{ flex: 1.6 }}><Text variant="bodySmall">{item.parentPhone || item.parent_phone || '-'}</Text></DataTable.Cell>
                <DataTable.Cell style={{ flex: 0.7 }}><Text variant="bodySmall">{item.roomNo || item.room_no || '-'}</Text></DataTable.Cell>
                <DataTable.Cell style={{ flex: 0.7 }}><Text variant="bodySmall">{item.floorNo || item.floor_no || '-'}</Text></DataTable.Cell>
                <DataTable.Cell style={{ flex: 0.7 }}><Text variant="bodySmall">{item.imd || '-'}</Text></DataTable.Cell>

                <DataTable.Cell style={{ flex: 1.2 }}><Text variant="bodySmall">{item.date ? new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</Text></DataTable.Cell>
                <DataTable.Cell numeric style={{ flex: 1 }}>
                  <Menu
                    visible={openMenuId === item.id}
                    onDismiss={() => setOpenMenuId(null)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        size={20}
                        iconColor={colors.slate500}
                        onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      />
                    }
                  >
                    <Menu.Item
                      leadingIcon="eye-outline"
                      onPress={() => { setOpenMenuId(null); handleViewDetails(item); }}
                      title="View Details"
                    />
                    <Menu.Item
                      leadingIcon="pencil-outline"
                      onPress={() => { setOpenMenuId(null); handleEditPress(item); }}
                      title="Edit"
                    />
                    <Divider />
                    <Menu.Item
                      leadingIcon="trash-can-outline"
                      onPress={() => { setOpenMenuId(null); handleDeleteRegistration(item); }}
                      title="Delete"
                      titleStyle={{ color: '#F43F5E' }}
                    />
                  </Menu>
                </DataTable.Cell>
              </>
            )}
          />
        ) : (
          <View style={styles.cardGrid}>
            {filteredData.map((item) => (
              <Card key={item.id} style={styles.itemCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Avatar.Text 
                      size={40} 
                      label={item.initials || (item.name ? item.name.substring(0, 2).toUpperCase() : '??')} 
                      style={styles.avatar}
                      labelStyle={styles.avatarLabel}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{item.name || `${item.first_name} ${item.last_name}`}</Text>
                      <Text variant="bodySmall" style={{ color: colors.slate500 }}>{item.email}</Text>
                    </View>
                    <Menu
                      visible={openMenuId === `card-${item.id}`}
                      onDismiss={() => setOpenMenuId(null)}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          size={20}
                          iconColor={colors.slate500}
                          onPress={() => setOpenMenuId(openMenuId === `card-${item.id}` ? null : `card-${item.id}`)}
                        />
                      }
                    >
                      <Menu.Item
                        leadingIcon="eye-outline"
                        onPress={() => { setOpenMenuId(null); handleViewDetails(item); }}
                        title="View Details"
                      />
                      <Menu.Item
                        leadingIcon="pencil-outline"
                        onPress={() => { setOpenMenuId(null); handleEditPress(item); }}
                        title="Edit"
                      />
                      <Divider />
                      <Menu.Item
                        leadingIcon="trash-can-outline"
                        onPress={() => { setOpenMenuId(null); handleDeleteRegistration(item); }}
                        title="Delete"
                        titleStyle={{ color: '#F43F5E' }}
                      />
                    </Menu>
                  </View>
                  
                  <View style={styles.cardDivider} />
                  
                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <IconButton icon="phone" size={16} iconColor={colors.slate400} style={{ margin: 0 }} />
                      <Text variant="bodySmall" style={styles.detailText}>{item.studentPhone || item.student_phone || '-'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <IconButton icon="office-building" size={16} iconColor={colors.slate400} style={{ margin: 0 }} />
                      <Text variant="bodySmall" style={styles.detailText}>Room {item.roomNo || item.room_no || '-'}, Floor {item.floorNo || item.floor_no || '-'}</Text>
                    </View>
                  </View>
                  

                </Card.Content>
              </Card>
            ))}
          </View>
        )}
        {!loading && filteredData.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="bodyMedium" style={{ color: colors.slate400 }}>No registrations found matching your criteria.</Text>
          </View>
        )}
      </Card>

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={() => { setIsModalVisible(false); setIsFingerprinting(false); }}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Title 
              title={isViewing ? "Registration Details" : isEditing ? "Edit Registration" : "Manual Registration"} 
              subtitle={isViewing ? "View full details for this registration record." : isEditing ? "Update details for this registration record." : "Enter details for a new renter application manually."}
              right={(props) => (
                <IconButton 
                  {...props} 
                  icon="close" 
                  onPress={() => setIsModalVisible(false)} 
                />
              )}
            />
            <ScrollView contentContainerStyle={styles.modalBody}>
              {isFingerprinting ? (
                <View style={styles.scannerContainer}>
                  <Surface style={styles.scannerHexagon} elevation={2}>
                    <Avatar.Icon size={80} icon="fingerprint" style={{ backgroundColor: 'transparent' }} color={colors.primary} />
                    <Animated.View style={[styles.scannerScanline, { backgroundColor: colors.primary, top: `${fingerprintProgress}%` }]} />
                  </Surface>
                  <View style={{ alignItems: 'center', gap: 4, marginTop: 24 }}>
                    <Text variant="titleMedium" style={styles.scannerStatus}>Scanning Fingerprint...</Text>
                    <Text variant="labelLarge" style={{ color: colors.primary, fontWeight: 'bold' }}>
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

                  <ProgressBar progress={fingerprintProgress / 100} color={colors.primary} style={styles.scannerProgressBar} />
                  <Text variant="labelSmall" style={styles.progressText}>{fingerprintProgress}% Complete</Text>
                </View>
              ) : (
                <View style={{ gap: 24 }}>
                  <View style={styles.formSection}>
                    <View style={styles.sectionHeader}>
                      <Avatar.Icon size={28} icon="account-details" style={{ backgroundColor: colors.indigo50 }} color={colors.primary} />
                      <Text variant="titleSmall" style={styles.sectionTitle}>Personal Details</Text>
                    </View>
                    <View style={styles.inputRow}>
                      <TextInput
                        label="First Name *"
                        value={formData.firstName}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, firstName: val }))}
                        mode="outlined"
                        style={[styles.input, { flex: 1 }]}
                        editable={!isViewing}
                        left={<TextInput.Icon icon="account" color={colors.slate400} />}
                        outlineStyle={{ borderRadius: 12 }}
                      />
                      <TextInput
                        label="Last Name *"
                        value={formData.lastName}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, lastName: val }))}
                        mode="outlined"
                        style={[styles.input, { flex: 1 }]}
                        editable={!isViewing}
                        left={<TextInput.Icon icon="account" color={colors.slate400} />}
                        outlineStyle={{ borderRadius: 12 }}
                      />
                    </View>
                    <TextInput
                      label="Email Address *"
                      value={formData.email}
                      onChangeText={(val) => setFormData(prev => ({ ...prev, email: val }))}
                      mode="outlined"
                      keyboardType="email-address"
                      style={styles.input}
                      editable={!isViewing}
                      left={<TextInput.Icon icon="email" color={colors.slate400} />}
                      outlineStyle={{ borderRadius: 12 }}
                    />
                  </View>

                  <View style={styles.formSection}>
                    <View style={styles.sectionHeader}>
                      <Avatar.Icon size={28} icon="phone-outline" style={{ backgroundColor: colors.indigo50 }} color={colors.primary} />
                      <Text variant="titleSmall" style={styles.sectionTitle}>Contact Information</Text>
                    </View>
                    <View style={styles.inputRow}>
                      <TextInput
                        label="Student Phone"
                        value={formData.studentPhone}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, studentPhone: val }))}
                        mode="outlined"
                        keyboardType="phone-pad"
                        style={[styles.input, { flex: 1 }]}
                        editable={!isViewing}
                        left={<TextInput.Icon icon="phone" color={colors.slate400} />}
                        outlineStyle={{ borderRadius: 12 }}
                      />
                      <TextInput
                        label="Parent Phone"
                        value={formData.parentPhone}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, parentPhone: val }))}
                        mode="outlined"
                        keyboardType="phone-pad"
                        style={[styles.input, { flex: 1 }]}
                        editable={!isViewing}
                        left={<TextInput.Icon icon="phone-settings" color={colors.slate400} />}
                        outlineStyle={{ borderRadius: 12 }}
                      />
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <View style={styles.sectionHeader}>
                      <Avatar.Icon size={28} icon="office-building-marker" style={{ backgroundColor: colors.indigo50 }} color={colors.primary} />
                      <Text variant="titleSmall" style={styles.sectionTitle}>Room Assignment</Text>
                    </View>
                    <View style={styles.inputRow}>
                      <TextInput
                        label="Room No *"
                        value={formData.roomNo}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, roomNo: val }))}
                        mode="outlined"
                        style={[styles.input, { flex: 1 }]}
                        editable={!isViewing}
                        left={<TextInput.Icon icon="door-open" color={colors.slate400} />}
                        outlineStyle={{ borderRadius: 12 }}
                      />
                      <TextInput
                        label="Floor No"
                        value={formData.floorNo}
                        onChangeText={(val) => setFormData(prev => ({ ...prev, floorNo: val }))}
                        mode="outlined"
                        style={[styles.input, { flex: 1 }]}
                        editable={!isViewing}
                        left={<TextInput.Icon icon="layers-outline" color={colors.slate400} />}
                        outlineStyle={{ borderRadius: 12 }}
                      />
                    </View>
                    <TextInput
                      label="IMD ID"
                      value={formData.imd}
                      onChangeText={(val) => setFormData(prev => ({ ...prev, imd: val }))}
                      mode="outlined"
                      style={styles.input}
                      editable={!isViewing}
                      left={<TextInput.Icon icon="card-account-details-outline" color={colors.slate400} />}
                      outlineStyle={{ borderRadius: 12 }}
                      placeholder="Enter IMD identification number"
                    />
                  </View>

                  <Surface style={[
                    styles.fingerprintSection, 
                    formData.hasFingerprint && { borderColor: colors.emerald500, backgroundColor: 'rgba(16, 185, 129, 0.04)' }
                  ]} elevation={0}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: colors.slate800 }}>Biometric Enrollment</Text>
                      <Text variant="bodySmall" style={{ color: colors.slate500 }}>
                        {formData.hasFingerprint ? 'Fingerprint successfully captured.' : 'Enrollment required for high-security access.'}
                      </Text>
                    </View>
                    <Button 
                      mode={formData.hasFingerprint ? "contained" : "outlined"} 
                      icon={formData.hasFingerprint ? "check-circle" : "fingerprint"}
                      onPress={isViewing ? null : startFingerprintScan}
                      style={{ borderRadius: 10 }}
                      buttonColor={formData.hasFingerprint ? colors.emerald500 : undefined}
                      disabled={isViewing}
                    >
                      {formData.hasFingerprint ? 'Captured' : 'Register'}
                    </Button>
                  </Surface>
                </View>
              )}
            </ScrollView>
            <Card.Actions style={styles.modalActions}>
              <Button 
                onPress={() => { setIsModalVisible(false); setIsFingerprinting(false); }} 
                mode="text"
                textColor={colors.slate500}
                style={{ borderRadius: 10 }}
              >
                {isViewing ? 'Close' : 'Cancel'}
              </Button>
              {!isViewing && (
                <Button 
                  onPress={handleSaveRegistration} 
                  mode="contained" 
                  disabled={isFingerprinting}
                  style={{ borderRadius: 10, overflow: 'hidden' }}
                  contentStyle={{ paddingHorizontal: 16 }}
                >
                  {isEditing ? 'Update Registration' : 'Add Registration'}
                </Button>
              )}
            </Card.Actions>
          </Card>
        </Modal>

        <Dialog
          visible={!!deleteTarget}
          onDismiss={() => setDeleteTarget(null)}
          style={{ borderRadius: 16, maxWidth: 440, alignSelf: 'center', width: '100%' }}
        >
          <Dialog.Icon icon="alert-circle-outline" color="#F43F5E" />
          <Dialog.Title style={{ textAlign: 'center' }}>Delete Registration</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: colors.slate600 }}>
              Are you sure you want to permanently delete the registration for{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {deleteTarget ? (deleteTarget.name || `${deleteTarget.first_name} ${deleteTarget.last_name}`) : ''}
              </Text>
              ? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'center', gap: 8, paddingBottom: 16 }}>
            <Button
              mode="outlined"
              onPress={() => setDeleteTarget(null)}
              style={{ borderRadius: 10, minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              buttonColor="#F43F5E"
              onPress={confirmDelete}
              style={{ borderRadius: 10, minWidth: 100 }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};
export const ActiveRenters = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState('table');
  const [selectedRenter, setSelectedRenter] = useState(null);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [viewingRenter, setViewingRenter] = useState(null);
  const [isExpirationModalVisible, setIsExpirationModalVisible] = useState(false);
  const [expirationTargetId, setExpirationTargetId] = useState(null);
  const [expirationDate, setExpirationDate] = useState('');
  const [expirationDays, setExpirationDays] = useState('');
  const { userRole, isAuthenticated } = usePermissions();
  const theme = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      fetchActiveRenters();
    }
  }, [isAuthenticated, userRole]);

  const isExpired = (item) => {
    if (!item.mealTicketExpirationDate) return false;
    const now = new Date();
    const expiration = new Date(item.mealTicketExpirationDate);
    expiration.setHours(23, 59, 59, 999);
    return now > expiration;
  };

  const applyDays = (days) => {
    const daysNum = parseInt(days);
    if (isNaN(daysNum)) {
      setExpirationDate('');
      setExpirationDays('');
      return;
    }
    
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + daysNum);
    
    setExpirationDate(expiration.toISOString().split('T')[0]);
    setExpirationDays(daysNum.toString());
  };

  const handleExpirationSubmit = async () => {
    try {
      if (!expirationTargetId) return;
      
      const payload = {
        expirationDate: expirationDate || null
      };
      
      const response = await axios.patch(`${API_URL}/${expirationTargetId}/meal-ticket-expiration`, payload);
      if (response.status === 200) {
        setData(prev => prev.map(item => item.id === expirationTargetId ? { ...item, mealTicketExpirationDate: response.data.mealTicketExpirationDate } : item));
        
        // If an expiration date is set, automatically enable meal ticket allowance
        if (expirationDate) {
          try {
            await axios.patch(`${API_BASE_URL}/registrations/${expirationTargetId}/meal-ticket-allowance`, {
              allowed: true
            });
            setData(prev => prev.map(item => item.id === expirationTargetId ? { ...item, canGenerateMealTicket: true } : item));
          } catch (allowanceErr) {
            console.error('Error automatically enabling allowance:', allowanceErr);
          }
        }

        setIsExpirationModalVisible(false);
        
        const renter = data.find(r => r.id === expirationTargetId);
        await createAuditLog({
          admin: userRole,
          adminId: userRole,
          type: 'Expiration Set',
          details: `Set expiration date for ${renter?.firstName} ${renter?.lastName} to ${expirationDate || 'Never'}`,
          subDetails: `Unit: ${renter?.unit || `Room ${renter?.roomNo}`}`,
          status: 'Success'
        });
      }
    } catch (error) {
      console.error('Error setting expiration:', error);
      Alert.alert('Error', 'Failed to update expiration.');
    } finally {
      setExpirationDays('');
      setExpirationTargetId(null);
    }
  };

  const fetchActiveRenters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        headers: {
          'x-user-role': userRole
        }
      });
      // Filter for active renters (those with Approved status)
      const approved = response.data.filter(r => r.status === 'Approved');
      setData(approved);
    } catch (error) {
      console.error('Error fetching active renters:', error);
      Alert.alert('Error', 'Failed to fetch active renters from server.');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const name = item.name || `${item.firstName} ${item.lastName}`;
      const unit = item.unit || `Room ${item.roomNo}`;
      return name.toLowerCase().includes(search.toLowerCase()) || 
             unit.toLowerCase().includes(search.toLowerCase());
    });
  }, [data, search]);

  const stats = useMemo(() => ({
    total: data.length,
    onSite: Math.floor(data.length * 0.4), // Mocking on-site for now as it's not in DB
    expiring: data.filter(r => {
      // Logic for expiring soon (e.g., created more than 30 days ago)
      const createdDate = new Date(r.date || r.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 25; // Expiring if more than 25 days old (just as an example)
    }).length
  }), [data]);

  const handleToggleAllowance = async (id, currentAllowed) => {
    try {
      const newAllowed = !currentAllowed;
      const renter = data.find(r => r.id === id);
      const response = await axios.patch(`${API_BASE_URL}/registrations/${id}/meal-ticket-allowance`, {
        allowed: newAllowed
      });
      
      if (response.status === 200) {
        setData(prev => prev.map(item => item.id === id ? { ...item, canGenerateMealTicket: newAllowed } : item));
        
        await createAuditLog({
          admin: userRole,
          adminId: userRole,
          type: 'Allowance Toggle',
          details: `${newAllowed ? 'Enabled' : 'Disabled'} meal ticket for: ${renter?.firstName} ${renter?.lastName}`,
          subDetails: `Unit: ${renter?.unit || `Room ${renter?.roomNo}`}`,
          status: 'Success'
        });
      }
    } catch (error) {
      console.error('Error toggling allowance:', error);
      Alert.alert('Error', 'Failed to update meal ticket allowance.');
    }
  };

  const handleViewDetails = (item) => {
    setViewingRenter(item);
    setIsDetailsVisible(true);
  };

  const handleTerminalDone = () => {
    setIsTerminalVisible(false);
    // User requested not to disable the toggle automatically after terminal use
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineMedium" style={styles.title}>Active Renters</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Real-time oversight of all authorized personnel currently on-site.</Text>
        </View>
        <Button mode="contained" icon="download" onPress={() => {}} style={styles.addButton}>
          Export Data
        </Button>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={44} icon="account-group" style={{ backgroundColor: colors.indigo50 }} color={colors.primary} />
            <View style={{ marginLeft: 16 }}>
              <Text variant="headlineSmall" style={styles.statValue}>{stats.total}</Text>
              <Text variant="labelMedium" style={styles.statLabel}>Total Active Renters</Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={44} icon="clock-outline" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }} color={colors.amber600} />
            <View style={{ marginLeft: 16 }}>
              <Text variant="headlineSmall" style={styles.statValue}>{stats.onSite}</Text>
              <Text variant="labelMedium" style={styles.statLabel}>Currently On-site</Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={44} icon="check-circle-outline" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }} color="#10B981" />
            <View style={{ marginLeft: 16 }}>
              <Text variant="headlineSmall" style={styles.statValue}>{stats.expiring}</Text>
              <Text variant="labelMedium" style={styles.statLabel}>Expiring Soon</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.filtersRow}>
        <TextInput
          placeholder="Search active renters..."
          value={search}
          onChangeText={setSearch}
          mode="outlined"
          left={<TextInput.Icon icon="magnify" color={colors.slate400} />}
          style={styles.searchBar}
          outlineStyle={{ borderRadius: 12, borderColor: colors.slate200 }}
        />
        <View style={styles.viewToggleGroup}>
          <IconButton 
            icon="view-list" 
            mode={viewType === 'table' ? 'contained' : 'standard'}
            containerColor={viewType === 'table' ? colors.primary : 'transparent'}
            iconColor={viewType === 'table' ? colors.white : colors.slate500}
            onPress={() => setViewType('table')}
            size={20}
          />
          <IconButton 
            icon="view-grid" 
            mode={viewType === 'grid' ? 'contained' : 'standard'}
            containerColor={viewType === 'grid' ? colors.primary : 'transparent'}
            iconColor={viewType === 'grid' ? colors.white : colors.slate500}
            onPress={() => setViewType('grid')}
            size={20}
          />
        </View>
      </View>

      <View style={[viewType === 'grid' && { flex: 1 }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ marginTop: 16, color: colors.slate500 }}>Loading active renters...</Text>
          </View>
        ) : viewType === 'table' ? (
          <Card style={styles.tableCard}>
            <Table 
              headers={['Renter', 'Unit', 'Expires On', 'Date Registered', 'Allow Meal Ticket', 'Actions']}
              columnFlex={[1.5, 1, 1, 1.4, 1.2, 0.8]}
              data={filteredData}
              renderRow={(item) => (
                <>
                  <DataTable.Cell style={{ flex: 1.5 }}>
                    <View style={styles.userInfo}>
                      <Avatar.Text 
                        size={32} 
                        label={item.initials || (item.name ? item.name.substring(0, 2).toUpperCase() : '??')} 
                        style={[styles.avatar, { backgroundColor: colors.slate800 }]} 
                        labelStyle={styles.avatarLabel} 
                      />
                      <View style={{ marginLeft: 12 }}>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{item.name || `${item.firstName} ${item.lastName}`}</Text>
                        <Text variant="bodySmall" style={{ color: colors.slate500 }}>{item.email}</Text>
                      </View>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <IconButton icon="office-building" size={14} iconColor={colors.slate400} style={{ margin: 0 }} />
                      <Text variant="bodySmall">{item.unit || `Room ${item.roomNo}`}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1 }}>
                    {item.mealTicketExpirationDate ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton icon="calendar-clock" size={14} iconColor={isExpired(item) ? colors.amber600 : colors.slate500} style={{ margin: 0, marginRight: -4 }} />
                        <Text variant="bodySmall" style={{ color: isExpired(item) ? colors.amber600 : colors.slate700 }}>
                          {new Date(item.mealTicketExpirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      </View>
                    ) : (
                      <Text variant="bodySmall" style={{ color: colors.slate400, fontStyle: 'italic', paddingLeft: 12 }}>Never</Text>
                    )}
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1.4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <IconButton icon="calendar" size={14} iconColor={colors.slate400} style={{ margin: 0 }} />
                      <Text variant="bodySmall">{item.date ? new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={{ flex: 1.2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
                      <Switch 
                        value={item.canGenerateMealTicket} 
                        onValueChange={() => handleToggleAllowance(item.id, item.canGenerateMealTicket)}
                        color={colors.primary}
                      />
                      <Text variant="labelSmall" style={{ color: item.canGenerateMealTicket ? (isExpired(item) ? colors.amber600 : colors.primary) : colors.slate400, minWidth: 80, textAlign: 'left' }}>
                        {item.canGenerateMealTicket ? (isExpired(item) ? 'ALLOWED (EXPIRED)' : 'ALLOWED') : 'RESTRICTED'}
                      </Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={{ flex: 0.8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <IconButton 
                        icon="calendar-remove" 
                        size={20} 
                        iconColor={isExpired(item) ? colors.amber600 : colors.slate400} 
                        onPress={() => {
                          setExpirationTargetId(item.id);
                          setExpirationDate(item.mealTicketExpirationDate ? item.mealTicketExpirationDate.split('T')[0] : '');
                          setExpirationDays('');
                          setIsExpirationModalVisible(true);
                        }} 
                      />
                      <IconButton icon="eye-outline" size={20} iconColor={colors.slate400} onPress={() => handleViewDetails(item)} />
                    </View>
                  </DataTable.Cell>
                </>
              )}
            />
          </Card>
        ) : (
          <View style={styles.cardGrid}>
            {filteredData.map((item) => (
              <Card key={item.id} style={styles.itemCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Avatar.Text 
                      size={40} 
                      label={item.initials || (item.name ? item.name.substring(0, 2).toUpperCase() : '??')} 
                      style={[styles.avatar, { backgroundColor: colors.slate800 }]} 
                      labelStyle={styles.avatarLabel} 
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{item.name || `${item.firstName} ${item.lastName}`}</Text>
                      <Text variant="bodySmall" style={{ color: colors.slate500 }}>{item.email}</Text>
                    </View>
                    <Surface style={[
                      styles.statusBadge, 
                      styles.standardBadge
                    ]} elevation={0}>
                      <Text variant="labelSmall" style={[
                        styles.statusBadgeText, 
                        styles.standardText
                      ]}>Standard</Text>
                    </Surface>
                  </View>
                  
                  <View style={styles.cardDivider} />
                  
                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <IconButton icon="office-building" size={16} iconColor={colors.slate400} style={{ margin: 0 }} />
                      <Text variant="bodySmall" style={styles.detailText}>{item.unit || `Room ${item.roomNo}`}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <IconButton icon="calendar" size={16} iconColor={colors.slate400} style={{ margin: 0 }} />
                      <Text variant="bodySmall" style={styles.detailText}>Registered: {item.date ? new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</Text>
                    </View>
                    {item.mealTicketExpirationDate && (
                      <View style={styles.detailRow}>
                        <IconButton icon="calendar-clock" size={16} iconColor={isExpired(item) ? colors.amber600 : colors.slate400} style={{ margin: 0 }} />
                        <Text variant="bodySmall" style={[styles.detailText, isExpired(item) && { color: colors.amber600, fontWeight: 'bold' }]}>
                          Expires: {new Date(item.mealTicketExpirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                    )}
                  </View>
                                    <View style={styles.cardActions}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.canGenerateMealTicket ? (isExpired(item) ? colors.amber500 : '#10B981') : colors.slate300, marginRight: 8 }} />
                        <Text variant="labelSmall" style={{ color: item.canGenerateMealTicket ? (isExpired(item) ? colors.amber600 : '#10B981') : colors.slate500, fontWeight: 'bold' }}>
                          {item.canGenerateMealTicket ? (isExpired(item) ? 'ALLOWED (EXPIRED)' : 'ALLOWED') : 'RESTRICTED'}
                        </Text>
                      </View>
                      <IconButton 
                        icon="calendar-remove" 
                        size={20} 
                        iconColor={isExpired(item) ? colors.amber600 : colors.slate400} 
                        onPress={() => {
                          setExpirationTargetId(item.id);
                          setExpirationDate(item.mealTicketExpirationDate ? item.mealTicketExpirationDate.split('T')[0] : '');
                          setExpirationDays('');
                          setIsExpirationModalVisible(true);
                        }} 
                      />
                      <IconButton icon="chevron-right" size={20} iconColor={colors.slate400} onPress={() => handleViewDetails(item)} />
                    </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </View>

      <Portal>
        <Modal
          visible={isTerminalVisible}
          onDismiss={handleTerminalDone}
          contentContainerStyle={styles.terminalModalContainer}
        >
          <BiometricTerminal 
            registrationId={selectedRenter?.id} 
            onExit={handleTerminalDone} 
          />
        </Modal>

        <Modal
          visible={isDetailsVisible}
          onDismiss={() => setIsDetailsVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Title 
              title="Renter Details" 
              subtitle="Comprehensive information for authorized personnel."
              right={(props) => {
                const { pointerEvents, ...rest } = props;
                return (
                  <IconButton 
                    {...rest} 
                    style={[rest.style, { pointerEvents }]} 
                    icon="close" 
                    onPress={() => setIsDetailsVisible(false)} 
                  />
                );
              }}
            />
            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={{ gap: 24 }}>
                <View style={styles.userInfoLarge}>
                  <Avatar.Text 
                    size={80} 
                    label={viewingRenter?.initials || (viewingRenter?.name ? viewingRenter.name.substring(0, 2).toUpperCase() : '??')} 
                    style={[styles.avatar, { backgroundColor: colors.primary }]}
                    labelStyle={{ fontSize: 32 }}
                  />
                  <View style={{ alignItems: 'center', marginTop: 16 }}>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>{viewingRenter?.name || `${viewingRenter?.firstName} ${viewingRenter?.lastName}`}</Text>
                    <Text variant="bodyLarge" style={{ color: colors.slate500 }}>{viewingRenter?.email}</Text>
                  </View>
                </View>

                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <Avatar.Icon size={24} icon="card-account-details-outline" style={{ backgroundColor: colors.indigo50 }} color={colors.primary} />
                    <Text variant="titleSmall" style={styles.sectionTitle}>Identification & Unit</Text>
                  </View>
                  <View style={styles.detailRowLarge}>
                    <View style={{ flex: 1 }}>
                      <Text variant="labelSmall" style={styles.detailLabel}>UNIT / ROOM</Text>
                      <Text variant="bodyMedium">{viewingRenter?.unit || `Room ${viewingRenter?.roomNo}`}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="labelSmall" style={styles.detailLabel}>IMD ID</Text>
                      <Text variant="bodyMedium">{viewingRenter?.imd || '-'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <Avatar.Icon size={24} icon="phone-outline" style={{ backgroundColor: colors.indigo50 }} color={colors.primary} />
                    <Text variant="titleSmall" style={styles.sectionTitle}>Contact Details</Text>
                  </View>
                  <View style={styles.detailRowLarge}>
                    <View style={{ flex: 1 }}>
                      <Text variant="labelSmall" style={styles.detailLabel}>STUDENT PHONE</Text>
                      <Text variant="bodyMedium">{viewingRenter?.studentPhone || viewingRenter?.student_phone || '-'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="labelSmall" style={styles.detailLabel}>PARENT PHONE</Text>
                      <Text variant="bodyMedium">{viewingRenter?.parentPhone || viewingRenter?.parent_phone || '-'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <Avatar.Icon size={24} icon="shield-check-outline" style={{ backgroundColor: colors.indigo50 }} color={colors.primary} />
                    <Text variant="titleSmall" style={styles.sectionTitle}>System Status</Text>
                  </View>
                  <View style={styles.detailRowLarge}>
                    <View style={{ flex: 1 }}>
                      <Text variant="labelSmall" style={styles.detailLabel}>BIOMETRICS</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton icon="fingerprint" size={16} iconColor={viewingRenter?.hasFingerprint ? colors.emerald500 : colors.slate300} style={{ margin: 0 }} />
                        <Text variant="bodyMedium">{viewingRenter?.hasFingerprint ? 'Enrolled' : 'Not Enrolled'}</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="labelSmall" style={styles.detailLabel}>MEAL TICKET</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton 
                          icon={viewingRenter?.canGenerateMealTicket ? "check-circle" : "cancel"} 
                          size={16} 
                          iconColor={viewingRenter?.canGenerateMealTicket ? (isExpired(viewingRenter) ? colors.amber500 : colors.emerald500) : colors.slate300} 
                          style={{ margin: 0 }} 
                        />
                        <Text variant="bodyMedium" style={{ fontWeight: viewingRenter?.canGenerateMealTicket && isExpired(viewingRenter) ? 'bold' : 'normal', color: viewingRenter?.canGenerateMealTicket && isExpired(viewingRenter) ? colors.amber600 : 'inherit' }}>
                          {viewingRenter?.canGenerateMealTicket ? (isExpired(viewingRenter) ? `Allowed (Expired: ${viewingRenter.mealTicketExpirationDate.split('T')[0]})` : 'Allowed') : 'Restricted'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
            <Card.Actions style={styles.modalActions}>
              <Button onPress={() => setIsDetailsVisible(false)} mode="contained" style={{ borderRadius: 10 }}>Close</Button>
            </Card.Actions>
          </Card>
        </Modal>

        <Modal
          visible={isExpirationModalVisible}
          onDismiss={() => setIsExpirationModalVisible(false)}
          contentContainerStyle={[styles.modalContainer, { maxWidth: 400 }]}
        >
          <Card style={styles.modalCard}>
            <Card.Title 
              title="Set Meal Ticket Expiration" 
              subtitle="Set an expiration date to disable allowance."
              left={(props) => <Avatar.Icon {...props} icon="calendar-remove" style={{ backgroundColor: colors.amber50 }} color={colors.amber600} />}
            />
            <Card.Content style={{ gap: 16 }}>
              <Text variant="bodyMedium" style={{ color: colors.slate600 }}>
                Choose an exact expiration date or quick select a duration for this renter's meal ticket privileges. Leave blank to remove expiration.
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8, flexWrap: 'wrap' }}>
                <Button mode={expirationDays === '1' ? 'contained' : 'outlined'} onPress={() => applyDays(1)} style={{ flex: 1, minWidth: 80, borderRadius: 8 }} compact>1 Day</Button>
                <Button mode={expirationDays === '3' ? 'contained' : 'outlined'} onPress={() => applyDays(3)} style={{ flex: 1, minWidth: 80, borderRadius: 8 }} compact>3 Days</Button>
                <Button mode={expirationDays === '7' ? 'contained' : 'outlined'} onPress={() => applyDays(7)} style={{ flex: 1, minWidth: 80, borderRadius: 8 }} compact>7 Days</Button>
                <TextInput
                  label="Custom Days"
                  value={expirationDays}
                  onChangeText={(val) => {
                    const cleaned = val.replace(/[^0-9]/g, '');
                    applyDays(cleaned);
                  }}
                  mode="outlined"
                  keyboardType="numeric"
                  style={{ flex: 1.5, minWidth: 120, height: 40 }}
                  outlineStyle={{ borderRadius: 8 }}
                  dense
                />
              </View>
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                {Platform.OS === 'web' ? (
                  <View style={{ flex: 1 }}>
                    <Text variant="labelSmall" style={{ color: colors.slate500, marginBottom: 8, marginLeft: 4, fontWeight: 'bold' }}>EXPIRATION DATE</Text>
                    {React.createElement('input', {
                      type: 'date',
                      value: expirationDate,
                      onChange: (e) => {
                        setExpirationDate(e.target.value);
                        setExpirationDays('');
                      },
                      style: {
                        width: '100%',
                        padding: '14px 16px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '12px',
                        fontSize: '16px',
                        color: '#1E293B',
                        backgroundColor: '#FFFFFF',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }
                    })}
                  </View>
                ) : (
                  <TextInput
                    label="Expiration Date"
                    value={expirationDate}
                    onChangeText={(val) => {
                      setExpirationDate(val);
                      setExpirationDays('');
                    }}
                    mode="outlined"
                    placeholder="YYYY-MM-DD"
                    style={{ flex: 1 }}
                    outlineStyle={{ borderRadius: 12 }}
                  />
                )}
              </View>
            </Card.Content>
            <Card.Actions style={styles.modalActions}>
              <Button onPress={() => setIsExpirationModalVisible(false)} mode="text" textColor={colors.slate500}>Cancel</Button>
              <Button onPress={handleExpirationSubmit} mode="contained" buttonColor={colors.amber600}>Save</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

export const AccessLogs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState('table');
  const theme = useTheme();

  const { userRole, isAuthenticated } = usePermissions();

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccessLogs();
    }
  }, [isAuthenticated, userRole]);

  const fetchAccessLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/access-logs`, {
        headers: {
          'x-user-role': userRole
        }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      Alert.alert('Error', 'Failed to fetch access logs from server.');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: data.length,
    denied: data.filter(r => r.status === 'Denied').length,
    activeEndpoints: new Set(data.filter(r => r.point).map(r => r.point)).size
  }), [data]);
  
  const filteredData = useMemo(() => {
    return data.filter(item => 
      (item.name && item.name.toLowerCase().includes(search.toLowerCase())) || 
      (item.point && item.point.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, data]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineMedium" style={styles.title}>Access Logs</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Real-time monitoring of entry points and security credentials.</Text>
        </View>
        <Button mode="contained" icon="refresh" onPress={fetchAccessLogs} style={styles.addButton} loading={loading} disabled={loading}>
          Refetch Data
        </Button>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={44} icon="clock-outline" style={{ backgroundColor: 'rgba(17, 50, 212, 0.1)' }} color={colors.primary} />
            <View style={{ marginLeft: 16 }}>
              <Text variant="headlineSmall" style={styles.statValue}>{stats.total}</Text>
              <Text variant="labelMedium" style={styles.statLabel}>Access Requests</Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={44} icon="close-circle-outline" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }} color={colors.rose500} />
            <View style={{ marginLeft: 16 }}>
              <Text variant="headlineSmall" style={styles.statValue}>{stats.denied}</Text>
              <Text variant="labelMedium" style={styles.statLabel}>Denied Attempts</Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Avatar.Icon size={44} icon="check-circle-outline" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }} color="#10B981" />
            <View style={{ marginLeft: 16 }}>
              <Text variant="headlineSmall" style={styles.statValue}>{stats.activeEndpoints}</Text>
              <Text variant="labelMedium" style={styles.statLabel}>Active Endpoints</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.filtersRow}>
        <TextInput
          placeholder="Search access logs..."
          value={search}
          onChangeText={setSearch}
          mode="outlined"
          left={<TextInput.Icon icon="magnify" color={colors.slate400} />}
          style={styles.searchBar}
          outlineStyle={{ borderRadius: 12, borderColor: colors.slate200 }}
        />
        <View style={styles.viewToggleGroup}>
          <IconButton 
            icon="view-list" 
            mode={viewType === 'table' ? 'contained' : 'standard'}
            containerColor={viewType === 'table' ? colors.primary : 'transparent'}
            iconColor={viewType === 'table' ? colors.white : colors.slate500}
            onPress={() => setViewType('table')}
            size={20}
          />
          <IconButton 
            icon="view-grid" 
            mode={viewType === 'grid' ? 'contained' : 'standard'}
            containerColor={viewType === 'grid' ? colors.primary : 'transparent'}
            iconColor={viewType === 'grid' ? colors.white : colors.slate500}
            onPress={() => setViewType('grid')}
            size={20}
          />
        </View>
      </View>

      <View style={[viewType === 'grid' && { flex: 1 }]}>
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text variant="bodyMedium" style={{ marginTop: 16, color: colors.slate500 }}>Loading access logs...</Text>
          </View>
        ) : viewType === 'table' ? (
          <Card style={styles.tableCard}>
            <Table 
              headers={['Timestamp', 'User', 'Access Point', 'Method', 'Status']}
              columnFlex={[1, 1.2, 1.6, 1.2, 1]}
              data={filteredData}
              renderRow={(item) => (
                <>
                  <DataTable.Cell style={{ flex: 1 }}><Text variant="bodySmall">{item.time}</Text></DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1.2 }}>
                    <View style={styles.userInfo}>
                      {item.avatar ? (
                        <Avatar.Image size={32} source={{ uri: item.avatar }} style={styles.avatar} />
                      ) : (
                        <Avatar.Icon size={32} icon="account-off" style={[styles.avatar, { backgroundColor: colors.slate800 }]} color={colors.slate400} />
                      )}
                      <View style={{ marginLeft: 12 }}>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
                        <Text variant="bodySmall" style={{ color: colors.slate500 }}>{item.dept}</Text>
                      </View>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1.6 }}><Text variant="bodySmall">{item.point}</Text></DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1.2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <IconButton icon={item.type === 'Biometric Scan' ? "fingerprint" : "cellphone"} size={14} iconColor={item.type === 'Biometric Scan' ? colors.primary : colors.slate400} style={{ margin: 0 }} />
                      <Text variant="bodySmall">{item.type}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1 }}>
                    <Surface style={[styles.statusBadge, item.status === 'Granted' ? styles.approvedBadge : styles.rejectedBadge]} elevation={0}>
                      <Text variant="labelSmall" style={[styles.statusBadgeText, item.status === 'Granted' ? styles.approvedText : styles.rejectedText]}>{item.status}</Text>
                    </Surface>
                  </DataTable.Cell>
                </>
              )}
            />
          </Card>
        ) : (
          <View style={styles.cardGrid}>
            {filteredData.map((item) => (
              <Card key={item.id} style={styles.itemCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    {item.avatar ? (
                      <Avatar.Image size={40} source={{ uri: item.avatar }} style={styles.avatar} />
                    ) : (
                      <Avatar.Icon size={40} icon="account-off" style={[styles.avatar, { backgroundColor: colors.slate800 }]} color={colors.slate400} />
                    )}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{item.name}</Text>
                      <Text variant="bodySmall" style={{ color: colors.slate500 }}>{item.dept}</Text>
                    </View>
                    <Surface style={[styles.statusBadge, item.status === 'Granted' ? styles.approvedBadge : styles.rejectedBadge]} elevation={0}>
                      <Text variant="labelSmall" style={[styles.statusBadgeText, item.status === 'Granted' ? styles.approvedText : styles.rejectedText]}>{item.status}</Text>
                    </Surface>
                  </View>
                  
                  <View style={styles.cardDivider} />
                  
                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <IconButton icon="map-marker" size={16} iconColor={colors.slate400} style={{ margin: 0 }} />
                      <Text variant="bodySmall" style={styles.detailText}>{item.point}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <IconButton icon={item.type === 'Biometric Scan' ? "fingerprint" : "cellphone"} size={16} iconColor={colors.slate400} style={{ margin: 0 }} />
                      <Text variant="bodySmall" style={styles.detailText}>{item.type}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <IconButton icon="clock-outline" size={16} iconColor={colors.slate400} style={{ margin: 0 }} />
                      <Text variant="bodySmall" style={styles.detailText}>{item.time}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
        {!loading && filteredData.length === 0 && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text variant="bodyMedium" style={{ color: colors.slate400 }}>No access logs found matching your criteria.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export const AuditLogs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState('table');
  const theme = useTheme();

  const { userRole, isAuthenticated } = usePermissions();

  useEffect(() => {
    if (isAuthenticated) {
      fetchAuditLogs();
    }
  }, [isAuthenticated, userRole]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/audit-logs`, {
        headers: {
          'x-user-role': userRole
        }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      Alert.alert('Error', 'Failed to fetch audit logs from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (data.length === 0) {
      Alert.alert('No Data', 'There are no audit logs to export.');
      return;
    }

    const reportId = `AL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const generatedAt = new Date().toLocaleString();
    const currentYear = new Date().getFullYear();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.4; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ef4444; padding-bottom: 15px; margin-bottom: 20px; }
            .branding h1 { margin: 0; font-size: 24px; color: #ef4444; font-weight: 800; }
            .metadata { text-align: right; font-size: 11px; color: #64748b; }
            .classification { display: inline-block; padding: 3px 10px; background: #fef2f2; border-radius: 4px; font-size: 10px; font-weight: 800; margin-bottom: 15px; color: #ef4444; border: 1px solid #fee2e2; }
            .section-title { font-size: 15px; font-weight: 800; margin: 25px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #f1f5f9; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px; }
            th { background-color: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; font-weight: 700; color: #475569; }
            td { padding: 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
            .status-success { color: #10b981; font-weight: 700; }
            .status-fail { color: #ef4444; font-weight: 700; }
            .timestamp { color: #64748b; font-size: 9px; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="branding"><h1>SecureAccess™</h1><p style="margin:0;font-size:12px;color:#64748b;">Enterprise Security Audit</p></div>
            <div class="metadata">REPORT_ID: ${reportId}<br>GENERATED: ${generatedAt}</div>
          </div>
          <div class="classification">OFFICIAL SYSTEM AUDIT TRAIL</div>
          
          <div class="section-title">ADMINISTRATIVE ACTION LOG</div>
          <table>
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>ADMINISTRATOR</th>
                <th>ACTION TYPE</th>
                <th>DETAILS</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(item => `
                <tr>
                  <td class="timestamp">${item.date}<br>${item.time}</td>
                  <td><strong>${item.admin}</strong><br><span style="color:#64748b;font-size:9px;">ID: ${item.adminId}</span></td>
                  <td>${item.type}</td>
                  <td>
                    <div style="font-weight:600;">${item.details}</div>
                    <div style="color:#64748b;font-size:9px;">${item.subDetails}</div>
                  </td>
                  <td class="${item.status === 'Success' ? 'status-success' : 'status-fail'}">${item.status.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Generated by SecureAccess System Administrator Console<br>
            © ${currentYear} BHAGOH PROJECT - Renter Systems. All rights reserved.
          </div>
        </body>
      </html>
    `;

    try {
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          setTimeout(() => { printWindow.print(); }, 500);
        }
      } else {
        await Print.printAsync({ html });
      }
    } catch (error) {
      console.error('Error exporting audit log:', error);
      Alert.alert('Error', 'Failed to generate PDF report');
    }
  };
  
  const filteredData = useMemo(() => {
    return data.filter(item => 
      (item.admin && item.admin.toLowerCase().includes(search.toLowerCase())) || 
      (item.details && item.details.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, data]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineMedium" style={styles.title}>Audit Logs</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Comprehensive trail of administrative actions.</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button mode="outlined" icon="refresh" onPress={fetchAuditLogs} loading={loading} disabled={loading} style={{ borderColor: colors.slate200 }}>
            Refresh
          </Button>
          <Button mode="contained" icon="database-download" onPress={handleDownloadReport} style={styles.addButton}>
            Download Report
          </Button>
        </View>
      </View>

      <View style={styles.filtersRow}>
        <TextInput
          placeholder="Search audit trail..."
          value={search}
          onChangeText={setSearch}
          mode="outlined"
          left={<TextInput.Icon icon="magnify" color={colors.slate400} />}
          style={styles.searchBar}
          outlineStyle={{ borderRadius: 12, borderColor: colors.slate200 }}
        />
        <View style={styles.viewToggleGroup}>
          <IconButton 
            icon="view-list" 
            mode={viewType === 'table' ? 'contained' : 'standard'}
            containerColor={viewType === 'table' ? colors.primary : 'transparent'}
            iconColor={viewType === 'table' ? colors.white : colors.slate500}
            onPress={() => setViewType('table')}
            size={20}
          />
          <IconButton 
            icon="view-grid" 
            mode={viewType === 'grid' ? 'contained' : 'standard'}
            containerColor={viewType === 'grid' ? colors.primary : 'transparent'}
            iconColor={viewType === 'grid' ? colors.white : colors.slate500}
            onPress={() => setViewType('grid')}
            size={20}
          />
        </View>
      </View>

      <View style={[viewType === 'grid' && { flex: 1 }]}>
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text variant="bodyMedium" style={{ marginTop: 16, color: colors.slate500 }}>Loading audit logs...</Text>
          </View>
        ) : viewType === 'table' ? (
          <Card style={styles.tableCard}>
            <Table 
              headers={['Administrator', 'Action Type', 'Details', 'Timestamp', 'Status']}
              columnFlex={[1.2, 1.2, 1.6, 1, 1]}
              data={filteredData}
              renderRow={(item) => (
                <>
                  <DataTable.Cell style={{ flex: 1.2 }}>
                    <View style={styles.userInfo}>
                      <Avatar.Text size={32} label={item.initials} style={[styles.avatar, { backgroundColor: colors.slate800 }]} labelStyle={styles.avatarLabel} />
                      <View style={{ marginLeft: 12 }}>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{item.admin}</Text>
                        <Text variant="bodySmall" style={{ color: colors.slate500 }}>{item.adminId}</Text>
                      </View>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1.2 }}><Text variant="bodySmall">{item.type}</Text></DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1.6 }}>
                    <View>
                      <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>{item.details}</Text>
                      <Text variant="bodySmall" style={{ color: colors.slate500 }}>{item.subDetails}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1 }}>
                    <View>
                      <Text variant="bodySmall">{item.time}</Text>
                      <Text variant="bodySmall" style={{ color: colors.slate500 }}>{item.date}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1 }}>
                    <Surface style={[styles.statusBadge, item.status === 'Success' ? styles.approvedBadge : styles.rejectedBadge]} elevation={0}>
                      <Text variant="labelSmall" style={[styles.statusBadgeText, item.status === 'Success' ? styles.approvedText : styles.rejectedText]}>{item.status}</Text>
                    </Surface>
                  </DataTable.Cell>
                </>
              )}
            />
          </Card>
        ) : (
          <View style={styles.cardGrid}>
            {filteredData.map((item) => (
              <Card key={item.id} style={styles.itemCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Avatar.Text size={40} label={item.initials} style={[styles.avatar, { backgroundColor: colors.slate800 }]} labelStyle={styles.avatarLabel} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{item.admin}</Text>
                      <Text variant="bodySmall" style={{ color: colors.slate500 }}>{item.adminId}</Text>
                    </View>
                    <Surface style={[styles.statusBadge, item.status === 'Success' ? styles.approvedBadge : styles.rejectedBadge]} elevation={0}>
                      <Text variant="labelSmall" style={[styles.statusBadgeText, item.status === 'Success' ? styles.approvedText : styles.rejectedText]}>{item.status}</Text>
                    </Surface>
                  </View>
                  
                  <View style={styles.cardDivider} />
                  
                  <View style={styles.cardDetails}>
                    <Text variant="labelMedium" style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 4 }}>{item.type}</Text>
                    <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>{item.details}</Text>
                    <Text variant="bodySmall" style={{ color: colors.slate500, marginBottom: 8 }}>{item.subDetails}</Text>
                    <View style={styles.detailRow}>
                      <IconButton icon="calendar-clock" size={16} iconColor={colors.slate400} style={{ margin: 0 }} />
                      <Text variant="bodySmall" style={styles.detailText}>{item.date} at {item.time}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
        {!loading && filteredData.length === 0 && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text variant="bodyMedium" style={{ color: colors.slate400 }}>No audit logs found matching your criteria.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export const Permissions = () => {
  const [viewType, setViewType] = useState('table');
  const theme = useTheme();

  const permissionList = Object.keys(PERMISSIONS);
  const roleList = Object.values(ROLES);

  const permissionData = permissionList.map(permKey => {
    const permission = PERMISSIONS[permKey];
    const row = { permission: permission.replace(/_/g, ' ').toUpperCase(), id: permKey };
    roleList.forEach(role => {
      row[role] = ROLE_PERMISSIONS[role].includes(permission);
    });
    return row;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineMedium" style={styles.title}>Role Permissions</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Matrix of system capabilities assigned to each user role.</Text>
        </View>
        <View style={styles.viewToggleGroup}>
          <IconButton 
            icon="view-list" 
            mode={viewType === 'table' ? 'contained' : 'standard'}
            containerColor={viewType === 'table' ? colors.primary : 'transparent'}
            iconColor={viewType === 'table' ? colors.white : colors.slate500}
            onPress={() => setViewType('table')}
            size={20}
          />
          <IconButton 
            icon="view-grid" 
            mode={viewType === 'grid' ? 'contained' : 'standard'}
            containerColor={viewType === 'grid' ? colors.primary : 'transparent'}
            iconColor={viewType === 'grid' ? colors.white : colors.slate500}
            onPress={() => setViewType('grid')}
            size={20}
          />
        </View>
      </View>

      <Card style={styles.tableCard}>
        {viewType === 'table' ? (
          <Table 
            headers={['Permission', ...roleList]}
            columnFlex={[1.5, 1, 1, 1, 1]}
            data={permissionData}
            renderRow={(item) => (
              <>
                <DataTable.Cell style={{ flex: 1.5 }}>
                  <Text variant="labelMedium" style={{ fontWeight: 'bold' }}>{item.permission}</Text>
                </DataTable.Cell>
                {roleList.map(role => (
                  <DataTable.Cell key={role} style={{ flex: 1, justifyContent: 'center' }}>
                    <IconButton 
                      icon={item[role] ? "check-circle" : "close-circle-outline"} 
                      iconColor={item[role] ? colors.emerald500 : colors.slate200} 
                      size={20}
                    />
                  </DataTable.Cell>
                ))}
              </>
            )}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', padding: 8, gap: 16 }}>
              {roleList.map(role => (
                <Card key={role} style={[styles.itemCard, { width: 300 }]}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <Avatar.Icon size={40} icon="security" style={{ backgroundColor: colors.indigo50 }} color={colors.primary} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{role}</Text>
                        <Text variant="bodySmall" style={{ color: colors.slate500 }}>
                          {ROLE_PERMISSIONS[role].length} Permissions
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardDivider} />
                    <View style={{ gap: 8 }}>
                      {permissionList.map(permKey => {
                        const hasPerm = ROLE_PERMISSIONS[role].includes(PERMISSIONS[permKey]);
                        return (
                          <View key={permKey} style={{ flexDirection: 'row', alignItems: 'center', opacity: hasPerm ? 1 : 0.4 }}>
                            <IconButton 
                              icon={hasPerm ? "check-circle" : "close-circle-outline"} 
                              iconColor={hasPerm ? colors.emerald500 : colors.slate300} 
                              size={16}
                              style={{ margin: 0 }}
                            />
                            <Text variant="bodySmall" style={{ 
                              color: hasPerm ? colors.slate700 : colors.slate400,
                              textDecorationLine: hasPerm ? 'none' : 'line-through'
                            }}>
                              {PERMISSIONS[permKey].replace(/_/g, ' ').toUpperCase()}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </ScrollView>
        )}
      </Card>
    </View>
  );
};

export const Configuration = () => {
  const theme = useTheme();
  
  // Network Configuration State
  const [backendUrl, setBackendUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedUrl = localStorage.getItem('BACKEND_URL');
      setBackendUrl(savedUrl || 'http://localhost:5000/api');
    }
  }, []);

  const handleSaveConfig = () => {
    if (Platform.OS === 'web') {
      localStorage.setItem('BACKEND_URL', backendUrl);
      Alert.alert(
        'Configuration Saved', 
        'Network settings updated successfully. Please restart the application for changes to take effect throughout all windows.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      // Try to hit the root /health endpoint
      const rootUrl = backendUrl.split('/api')[0];
      const response = await axios.get(`${rootUrl}/health`, { timeout: 5000 });
      if (response.status === 200) {
        Alert.alert('Connection Success', 'Successfully connected to the backend server.');
      } else {
        throw new Error(`Server returned status: ${response.status}`);
      }
    } catch (error) {
      Alert.alert('Connection Failed', `Could not reach the backend. ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineMedium" style={styles.title}>System Configuration</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Fine-tune security protocols and global application settings.</Text>
        </View>
        <Button mode="contained" icon="cpu" onPress={() => {}} style={styles.addButton}>
          Export Config
        </Button>
      </View>

      {/* Network Configuration Section */}
      <Card style={[styles.tableCard, { marginBottom: 24 }]}>
        <Card.Title 
          title="Network Configuration" 
          subtitle="Configure backend connectivity for Terminal and Admin nodes"
          left={(props) => <Avatar.Icon {...props} icon="lan" style={{ backgroundColor: colors.indigo50 }} color={colors.primary} />}
        />
        <Card.Content style={{ paddingTop: 8 }}>
          <View style={{ gap: 16 }}>
            <View style={styles.inputGroup}>
              <Text variant="labelMedium" style={styles.inputLabel}>Backend API Base URL</Text>
              <TextInput
                value={backendUrl}
                onChangeText={setBackendUrl}
                mode="outlined"
                placeholder="http://localhost:5000/api"
                outlineStyle={{ borderRadius: 12 }}
                left={<TextInput.Icon icon="server-network" color={colors.slate400} />}
                style={{ backgroundColor: colors.white }}
              />
              <Text variant="bodySmall" style={{ color: colors.slate500, marginTop: 4 }}>
                This address will be used by both the Admin Panel and the Biometric Terminal.
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Button 
                mode="contained" 
                icon="content-save" 
                onPress={handleSaveConfig}
                style={[styles.addButton, { flex: 1 }]}
              >
                Save & Apply Settings
              </Button>
              <Button 
                mode="outlined" 
                icon="connection" 
                onPress={handleTestConnection}
                loading={isTesting}
                disabled={isTesting}
                style={{ borderRadius: 12, flex: 0.8, borderColor: colors.slate200 }}
              >
                Test Connection
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>


    </View>
  );
};


export const FingerprintUI = () => <SkeletonScreen title="Fingerprint Recognition" subtitle="Visual interface for multi-spectral biometric scanning operations." />;

export const AdminInteractive = () => {
  const [logs, setLogs] = useState([
    { id: 1, time: '07:42:15', type: 'INFO', msg: 'System initialized. All terminals online.' },
    { id: 2, time: '07:45:02', type: 'SEC', msg: 'Secondary auth bypass detected in Sector B.' },
    { id: 3, time: '07:50:33', type: 'WARN', msg: 'Database latency exceeding 200ms threshold.' },
    { id: 4, time: '07:56:44', type: 'INFO', msg: 'Admin session started from 192.168.1.42' },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineMedium" style={styles.title}>Admin Interactive</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Execute system-level overrides and monitor real-time security events.</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 24, flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Card style={styles.tableCard}>
            <Card.Title title="System Overrides" titleVariant="titleLarge" subtitle="Emergency and maintenance controls" divider />
            <Card.Content style={{ padding: 16 }}>
              {[
                { label: 'Panic Mode', desc: 'Lock all entry points immediately', color: colors.rose500, icon: 'alert-octagon' },
                { label: 'Maintenance Window', desc: 'Disable biometric scanners for 30m', color: colors.primary, icon: 'tools' },
                { label: 'Auth Bypass', desc: 'Enable emergency bypass codes', color: colors.amber500, icon: 'key-alert' },
              ].map((item, idx) => (
                <Surface key={idx} style={styles.overrideItem} elevation={1}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Avatar.Icon size={36} icon={item.icon} color={colors.white} style={{ backgroundColor: item.color }} />
                    <View style={{ marginLeft: 16, flex: 1 }}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.label}</Text>
                      <Text variant="bodySmall" style={{ color: colors.slate500 }}>{item.desc}</Text>
                    </View>
                    <Switch value={false} onValueChange={() => {}} color={item.color} />
                  </View>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        </View>

        <View style={{ flex: 1.5 }}>
          <Card style={[styles.tableCard, { backgroundColor: '#0F172A', flex: 1 }]}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="labelLarge" style={{ color: colors.slate400, letterSpacing: 1 }}>SYSTEM_LOGS_V4.0</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.rose500 }} />
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.amber500 }} />
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.emerald500 }} />
              </View>
            </View>
            <View style={{ padding: 16 }}>
              {logs.map(log => (
                <View key={log.id} style={{ marginBottom: 12, flexDirection: 'row', gap: 12 }}>
                  <Text style={styles.consoleTime}>[{log.time}]</Text>
                  <Text style={[styles.consoleType, { color: log.type === 'SEC' ? colors.rose400 : log.type === 'WARN' ? colors.amber400 : colors.emerald400 }]}>{log.type}:</Text>
                  <Text style={styles.consoleMsg}>{log.msg}</Text>
                </View>
              ))}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, alignItems: 'center' }}>
                <Text style={{ color: colors.primary, fontWeight: '900' }}>{'>'}</Text>
                <TextInput 
                  placeholder="Execute command..." 
                  placeholderTextColor="#475569" 
                  style={styles.consoleInput}
                  textColor={colors.white}
                  mode="flat"
                  dense
                  contentStyle={{ paddingHorizontal: 0, height: 32 }}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                />
              </View>
            </View>
          </Card>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.backgroundLight, 
    padding: 24 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 32 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: colors.slate800, 
    letterSpacing: -0.5 
  },
  subtitle: { 
    fontSize: 14, 
    color: colors.slate500, 
    marginTop: 4, 
    lineHeight: 20 
  },
  addButton: { 
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsRow: { 
    flexDirection: 'row', 
    gap: 16, 
    marginBottom: 24 
  },
  statCard: { 
    flex: 1, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: colors.slate100,
    backgroundColor: colors.white,
  },
  statContent: {
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 16
  },
  statValue: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: colors.slate800 
  },
  statLabel: { 
    fontSize: 12, 
    color: colors.slate500, 
    marginTop: 2 
  },
  filtersRow: { 
    marginBottom: 20, 
    flexDirection: 'row', 
    gap: 12, 
    alignItems: 'center' 
  },
  searchBar: { 
    flex: 1, 
    backgroundColor: colors.white 
  },
  segmentedButtons: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 48,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  tableCard: { 
    backgroundColor: colors.white, 
    borderRadius: 16, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: colors.slate100,
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  avatar: { 
    borderRadius: 10 
  },
  avatarLabel: { 
    fontWeight: '800' 
  },

  overrideItem: { 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 12, 
    backgroundColor: colors.slate50, 
    borderWidth: 1, 
    borderColor: colors.slate100 
  },
  consoleTime: { 
    color: colors.slate500, 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    fontSize: 12 
  },
  consoleType: { 
    fontWeight: '800', 
    fontSize: 12, 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  consoleMsg: { 
    color: colors.slate200, 
    flex: 1, 
    fontSize: 12, 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  consoleInput: { 
    fontSize: 12, 
    flex: 1, 
    height: 32,
    color: colors.white
  },
  tinyText: { 
    fontSize: 10, 
    color: colors.slate500 
  },
  placeholder: { 
    flex: 1, 
    backgroundColor: colors.slate50, 
    borderRadius: 16, 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: colors.slate200, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 20 
  },
  placeholderText: { 
    color: colors.slate400, 
    fontSize: 14 
  },
  modalContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 550,
    borderRadius: 24,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  modalContent: { 
    backgroundColor: colors.white, 
    width: '100%', 
    maxWidth: 680, 
    borderRadius: 24,
  },
  modalHeader: { 
    padding: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.slate100 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: colors.slate800 
  },
  modalSubtitle: { 
    fontSize: 14, 
    color: colors.slate500, 
    marginTop: 4 
  },
  modalBody: { 
    padding: 24, 
    maxHeight: 500 
  },
  inputRow: { 
    flexDirection: 'row', 
    gap: 16, 
    marginBottom: 16 
  },
  inputGroup: { 
    gap: 8, 
    marginBottom: 16 
  },
  inputLabel: { 
    fontSize: 13, 
    fontWeight: '800', 
    color: colors.slate700 
  },
  modalActions: { 
    padding: 24, 
    borderTopWidth: 1, 
    borderTopColor: colors.slate100, 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    gap: 12 
  },
  fingerprintSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    backgroundColor: colors.slate50, 
    borderWidth: 1, 
    borderColor: colors.slate200, 
    borderRadius: 16, 
    padding: 16, 
    borderStyle: 'dashed' 
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.slate700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formSection: {
    marginBottom: 8,
  },
  scannerContainer: { 
    alignItems: 'center', 
    paddingVertical: 32, 
    gap: 20 
  },
  scannerHexagon: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    backgroundColor: colors.indigo50, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 2, 
    borderColor: colors.primary, 
    position: 'relative', 
    overflow: 'hidden' 
  },
  scannerScanline: { 
    position: 'absolute', 
    width: '100%', 
    height: 2, 
    backgroundColor: colors.primary 
  },
  scannerStatus: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: colors.slate800, 
    marginTop: 8 
  },
  progressContainer: { 
    width: '80%', 
    height: 6, 
    backgroundColor: colors.slate100, 
    borderRadius: 3, 
    overflow: 'hidden' 
  },
  progressBar: { 
    height: '100%', 
    backgroundColor: colors.primary 
  },
  progressText: { 
    fontSize: 13, 
    color: colors.slate500, 
    fontWeight: '800' 
  },
  scanIndicatorRow: { 
    flexDirection: 'row', 
    gap: 12 
  },
  scanDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: colors.slate200 
  },
  scanDotActive: { 
    backgroundColor: colors.primary, 
    transform: [{ scale: 1.2 }] 
  },
  scanDotDone: { 
    backgroundColor: colors.emerald500 
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.slate100,
    borderRadius: 12,
    padding: 2,
    marginLeft: 12,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 8,
  },
  itemCard: {
    width: Platform.OS === 'web' ? '31%' : '100%',
    minWidth: 300,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.slate100,
    marginBottom: 12,
  },
  cardDetails: {
    marginBottom: 16,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: colors.slate600,
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 'auto',
  },
  terminalModalContainer: {
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoLarge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  detailRowLarge: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 24,
  },
  detailLabel: {
    fontSize: 10,
    color: colors.slate400,
    fontWeight: '900',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});



export const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const theme = useTheme();

  const { userRole, isAuthenticated } = usePermissions();

  useEffect(() => {
    if (isAuthenticated) {
      fetchReportData();
    }
  }, [isAuthenticated, userRole, activeTab]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/reports/summary`, {
        headers: {
          'x-user-role': userRole
        }
      });
      setData(res.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      Alert.alert('Error', 'Failed to fetch reporting data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!data) return;

    const reportId = `SA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const generatedAt = new Date().toLocaleString();
    const currentYear = new Date().getFullYear();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; line-height: 1.4; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; }
            .branding h1 { margin: 0; font-size: 24px; color: #6366f1; font-weight: 800; }
            .metadata { text-align: right; font-size: 11px; color: #64748b; }
            .classification { display: inline-block; padding: 3px 10px; background: #f1f5f9; border-radius: 4px; font-size: 10px; font-weight: 800; margin-bottom: 15px; color: #475569; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 30px; }
            .stat-box { background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; }
            .stat-value { font-size: 18px; font-weight: 800; }
            .section-title { font-size: 15px; font-weight: 800; margin: 25px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
            th { background-color: #f8fafc; text-align: left; padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #475569; }
            td { padding: 10px; border-bottom: 1px solid #f8fafc; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
            .sig-box { width: 200px; border-top: 1px solid #94a3b8; padding-top: 8px; font-size: 11px; text-align: center; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="branding"><h1>SecureAccess™</h1><p style="margin:0;font-size:12px;color:#64748b;">Enterprise System</p></div>
            <div class="metadata">ID: ${reportId}<br>Date: ${generatedAt}</div>
          </div>
          <div class="classification">CONFIDENTIAL OFFICIAL REPORT</div>
          
          <div class="section-title">EXECUTIVE SUMMARY</div>
          <div class="stats-grid">
            <div class="stat-box"><div class="stat-label">TOTAL RESIDENTS</div><div class="stat-value">${data.summary.totalRenters}</div></div>
            <div class="stat-box"><div class="stat-label">ACTIVE MEAL</div><div class="stat-value">${data.summary.activeRenters}</div></div>
            <div class="stat-box"><div class="stat-label">BIOMETRIC ENROLLED</div><div class="stat-value">${data.biometricUsersList.length}</div></div>
            <div class="stat-box"><div class="stat-label">DENIED RATE</div><div class="stat-value">${Math.round((data.summary.deniedAccessToday / (data.summary.successfulAccessToday + data.summary.deniedAccessToday || 1)) * 100)}%</div></div>
          </div>

          <div class="section-title">ACTIVE RENTERS (MEAL PRIVILEGES)</div>
          <table>
            <thead><tr><th>NAME</th><th>ROOM</th><th>CONTACT</th><th>DATE REG.</th></tr></thead>
            <tbody>${data.activeRentersList.map(r => `<tr><td>${r.name}</td><td>${r.roomNo || r.room_no || 'N/A'}</td><td>${r.studentPhone || r.student_phone || 'N/A'}</td><td>${r.date || 'N/A'}</td></tr>`).join('')}</tbody>
          </table>

          <div class="page-break"></div>

          <div class="section-title">BIOMETRIC ENROLLED USERS</div>
          <table>
            <thead><tr><th>NAME</th><th>INITIALS</th><th>ROOM</th><th>HAS FINGERPRINT</th></tr></thead>
            <tbody>${data.biometricUsersList.map(r => `<tr><td>${r.name}</td><td>${r.initials || 'N/A'}</td><td>${r.roomNo || r.room_no || 'N/A'}</td><td>YES</td></tr>`).join('')}</tbody>
          </table>

          <div class="signatures"><div class="sig-box">Operations Manager</div><div class="sig-box">Security Supervisor</div></div>
          <div class="footer">© ${currentYear} Renter Systems International. Generated by System Administrator.</div>
        </body>
      </html>
    `;

    try {
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          setTimeout(() => { printWindow.print(); }, 500);
        }
      } else {
        await Print.printAsync({ html });
      }
    } catch (error) {
      console.error('Printing error:', error);
      Alert.alert('Error', 'Failed to generate enterprise report');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>System Reports</Text>
          <Text style={styles.subtitle}>Enterprise analytics and audit summary</Text>
        </View>
        <Button mode="contained" icon="printer" onPress={handlePrint} style={styles.addButton}>
          Print Full Report
        </Button>
      </View>

      <View style={styles.filtersRow}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { 
              value: 'summary', 
              label: 'General Summary', 
              icon: 'chart-timeline-variant',
              showSelectedCheck: true 
            },
            { 
              value: 'active', 
              label: `Active Renters (${data?.activeRentersList?.length || 0})`, 
              icon: 'account-group',
              showSelectedCheck: true 
            },
            { 
              value: 'biometric', 
              label: `Biometric Status (${data?.biometricUsersList?.length || 0})`, 
              icon: 'fingerprint',
              showSelectedCheck: true 
            },
          ]}
          style={styles.segmentedButtons}
          theme={{ 
            colors: { 
              secondaryContainer: `${colors.primary}15`, 
              onSecondaryContainer: colors.primary,
              outline: 'transparent'
            } 
          }}
        />
      </View>

      {activeTab === 'summary' && (
        <>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Avatar.Icon size={40} icon="account-group" backgroundColor={colors.indigo50} color={colors.primary} />
                <View style={{ marginLeft: 16 }}>
                  <Text style={styles.statValue}>{data?.summary?.totalRenters}</Text>
                  <Text style={styles.statLabel}>Total Renters</Text>
                </View>
              </View>
            </Card>
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Avatar.Icon size={40} icon="fingerprint" backgroundColor={colors.emerald50} color={colors.emerald600} />
                <View style={{ marginLeft: 16 }}>
                  <Text style={styles.statValue}>{data?.biometricUsersList?.length}</Text>
                  <Text style={styles.statLabel}>Biometric Enrolled</Text>
                </View>
              </View>
            </Card>
          </View>

          <Card style={styles.tableCard}>
            <Text style={{ padding: 16, fontWeight: '800', borderBottomWidth: 1, borderBottomColor: colors.slate100 }}>
              Recent Access Activity
            </Text>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Name</DataTable.Title>
                <DataTable.Title>Point</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
              </DataTable.Header>
              {data?.recentActivity?.map((item, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{item.name}</DataTable.Cell>
                  <DataTable.Cell>{item.point}</DataTable.Cell>
                  <DataTable.Cell>
                    <Text style={{ color: item.status === 'Success' ? colors.emerald600 : colors.amber600 }}>
                      {item.status}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card>
        </>
      )}

      {activeTab === 'active' && (
        <Card style={styles.tableCard}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title>Room</DataTable.Title>
              <DataTable.Title>Meal Benefit</DataTable.Title>
            </DataTable.Header>
            {data?.activeRentersList?.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{item.name}</DataTable.Cell>
                <DataTable.Cell>{item.roomNo || item.room_no || 'N/A'}</DataTable.Cell>
                <DataTable.Cell><Text style={{color: colors.emerald600}}>ENABLED</Text></DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card>
      )}

      {activeTab === 'biometric' && (
        <Card style={styles.tableCard}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title>Initials</DataTable.Title>
              <DataTable.Title>Fingerprint Status</DataTable.Title>
            </DataTable.Header>
            {data?.biometricUsersList?.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{item.name}</DataTable.Cell>
                <DataTable.Cell>{item.initials || 'N/A'}</DataTable.Cell>
                <DataTable.Cell><Text style={{color: colors.primary}}>ENROLLED</Text></DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card>
      )}
    </View>
  );
};
