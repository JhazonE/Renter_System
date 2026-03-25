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
    backgroundColor: colors.background,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarWrapper: {
    width: 256,
    height: '100%',
    overflow: 'hidden',
    borderRightWidth: 1,
    borderRightColor: colors.slate100,
    backgroundColor: 'white',
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
});
