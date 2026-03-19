import React from 'react';

import { View, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

const BREAKPOINT = 1024;

export const ResponsiveLayout = ({
  sidebar,
  header,
  children,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;

  return (
    <View style={styles.container}>
      {header}
      <View style={styles.contentWrapper}>
        {isDesktop && (
          <View style={styles.sidebarWrapper}>
            {sidebar}
          </View>
        )}
        <View style={styles.mainContent}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {children}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh',
    backgroundColor: colors.backgroundDark,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarWrapper: {
    width: 256,
    borderRightWidth: 1,
    borderRightColor: 'rgba(17, 50, 212, 0.1)',
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
});
