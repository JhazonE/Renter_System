import React, { useState, useEffect } from 'react';

import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Search, UserPlus, Edit3, Trash2, X } from 'lucide-react-native';
import { Table } from '../components/Table';

const API_URL = 'http://localhost:5000/api/users';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Don't alert on initial load if it's just a connection issue, but show in console
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Validation Error', 'Please fill in name, email, and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(API_URL, formData);
      setUsers(prev => [response.data, ...prev]);
      setIsModalVisible(false);
      setFormData({ name: '', email: '', role: 'Staff', password: '' });
      Alert.alert('Success', 'User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      Alert.alert('Error', 'Failed to add user to database. Make sure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>Manage system access, roles, and security permissions for all active users.</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <UserPlus size={18} color={colors.white} />
          <Text style={styles.addButtonText}>Add New User</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filtersRow}>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={styles.activeTabText}>All Users</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{users.length}</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Administrators</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Staff</Text></TouchableOpacity>
        </View>
        
        <View style={styles.searchBox}>
          <Search size={16} color={colors.slate400} />
          <TextInput 
            placeholder="Search users or roles..." 
            placeholderTextColor={colors.slate400}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      
      <View style={styles.tableCard}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.subtitle, { marginTop: 12 }]}>Loading users...</Text>
          </View>
        ) : (
          <Table 
            headers={['User Details', 'Role', 'Status', 'Last Login', 'Actions']}
            data={filteredUsers}
            renderRow={(item) => (
              <>
                <View style={[styles.cell, { flex: 1.5, flexDirection: 'row', gap: 12 }]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                </View>
                <View style={styles.cell}>
                  <View style={[styles.roleBadge, item.role === 'Administrator' ? styles.adminBadge : {}]}>
                    <Text style={[styles.roleText, item.role === 'Administrator' ? styles.adminText : {}]}>{item.role}</Text>
                  </View>
                </View>
                <View style={styles.cell}>
                  <View style={styles.statusBox}>
                    <View style={[styles.statusDot, { backgroundColor: item.status === 'Active' ? colors.emerald500 : colors.slate400 }]} />
                    <Text style={[styles.statusText, { color: item.status === 'Active' ? colors.emerald500 : colors.slate400 }]}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.loginText}>{item.lastLogin || 'Never'}</Text>
                </View>
                <View style={[styles.cell, styles.actionsCell]}>
                  <TouchableOpacity><Edit3 size={16} color={colors.slate400} /></TouchableOpacity>
                  <TouchableOpacity><Trash2 size={16} color={colors.rose500} /></TouchableOpacity>
                </View>
              </>
            )}
          />
        )}
        {!loading && filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No users found. Try adding one!</Text>
          </View>
        )}
      </View>

      {/* Add User Modal */}
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
              <View>
                <Text style={styles.modalTitle}>Add New User</Text>
                <Text style={styles.modalSubtitle}>Create a new account for a system administrator or staff member.</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color={colors.slate400} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={colors.slate500}
                  value={formData.name}
                  onChangeText={(val) => setFormData(prev => ({ ...prev, name: val }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="name@secureaccess.io"
                  placeholderTextColor={colors.slate500}
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(val) => setFormData(prev => ({ ...prev, email: val }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>System Password *</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="••••••••"
                  placeholderTextColor={colors.slate500}
                  secureTextEntry={true}
                  value={formData.password}
                  onChangeText={(val) => setFormData(prev => ({ ...prev, password: val }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>System Role *</Text>
                <View style={styles.roleSelection}>
                  {['Staff', 'Administrator'].map(role => (
                    <TouchableOpacity 
                      key={role}
                      style={[styles.roleOption, formData.role === role && styles.roleOptionActive]}
                      onPress={() => setFormData(prev => ({ ...prev, role }))}
                    >
                      <Text style={[styles.roleOptionText, formData.role === role && styles.roleOptionActiveText]}>
                        {role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                onPress={handleAddUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1200,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    ...typography.h1,
    color: colors.white,
    fontSize: 28,
  },
  subtitle: {
    ...typography.body,
    color: colors.slate400,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
  },
  addButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17, 50, 212, 0.1)',
  },
  activeTab: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    gap: 8,
  },
  tabText: {
    ...typography.body,
    color: colors.slate400,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeText: {
    ...typography.tiny,
    color: colors.white,
    fontSize: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 8,
    paddingHorizontal: 12,
    width: 320,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(17, 50, 212, 0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: colors.white,
    ...typography.body,
  },
  tableCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(17, 50, 212, 0.1)',
    overflow: 'hidden',
    minHeight: 200,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    ...typography.body,
    color: colors.slate400,
  },
  cell: {
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(17, 50, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.tiny,
    color: colors.primary,
  },
  userName: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
  userEmail: {
    ...typography.caption,
    color: colors.slate500,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    alignSelf: 'flex-start',
  },
  adminBadge: {
    backgroundColor: 'rgba(17, 50, 212, 0.1)',
    borderColor: 'rgba(17, 50, 212, 0.2)',
  },
  roleText: {
    ...typography.tiny,
    color: colors.slate400,
  },
  adminText: {
    color: colors.primary,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...typography.body,
    fontSize: 13,
  },
  loginText: {
    ...typography.body,
    color: colors.slate500,
    fontSize: 13,
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.slate900,
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(17, 50, 212, 0.2)',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17, 50, 212, 0.1)',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.white,
    fontSize: 20,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.slate400,
    marginTop: 4,
  },
  modalBody: {
    padding: 24,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    ...typography.body,
    color: colors.slate300,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: colors.slate800,
    borderWidth: 1,
    borderColor: 'rgba(17, 50, 212, 0.1)',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    color: colors.white,
    ...typography.body,
  },
  roleSelection: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(17, 50, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
  },
  roleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(17, 50, 212, 0.1)',
  },
  roleOptionText: {
    ...typography.body,
    color: colors.slate400,
    fontSize: 14,
  },
  roleOptionActiveText: {
    color: colors.primary,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(17, 50, 212, 0.1)',
    backgroundColor: 'rgba(30, 41, 59, 0.2)',
  },
  cancelButton: {
    height: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.slate400,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 40,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  submitButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
});
