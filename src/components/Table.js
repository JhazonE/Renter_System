import React from 'react';

import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const Table = ({ headers, data, renderRow }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {headers.map((header, idx) => (
          <Text key={idx} style={[styles.headerText, idx === headers.length - 1 && { textAlign: 'right' }]}>
            {header}
          </Text>
        ))}
      </View>
      <View style={styles.body}>
        {data.map((item, idx) => (
          <View key={idx} style={[styles.row, idx === data.length - 1 && { borderBottomWidth: 0 }]}>
            {renderRow(item)}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17, 50, 212, 0.1)',
  },
  headerText: {
    ...typography.tiny,
    color: colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
  },
  body: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17, 50, 212, 0.05)',
    alignItems: 'center',
  },
});
