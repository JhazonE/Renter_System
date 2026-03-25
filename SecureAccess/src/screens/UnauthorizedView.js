import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, useTheme, Card } from 'react-native-paper';
import { colors } from '../theme/colors';

export const UnauthorizedView = ({ onBackToDashboard }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Card style={styles.card} elevation={2}>
        <Card.Content style={styles.content}>
          <Avatar.Icon 
            size={80} 
            icon="shield-lock" 
            style={styles.icon} 
            color={colors.rose500} 
          />
          <Text variant="headlineMedium" style={styles.title}>Access Denied</Text>
          <Text variant="bodyLarge" style={styles.message}>
            You don't have the necessary permissions to access this area. 
            Please contact your system administrator if you believe this is an error.
          </Text>
          <Button 
            mode="contained" 
            onPress={onBackToDashboard}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Back to Dashboard
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    backgroundColor: colors.white,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  icon: {
    backgroundColor: colors.rose50,
    marginBottom: 24,
  },
  title: {
    fontWeight: '800',
    color: colors.slate900,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: colors.slate500,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    borderRadius: 12,
    minWidth: 200,
  },
  buttonContent: {
    paddingVertical: 6,
  },
});
