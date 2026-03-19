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
    backgroundColor: colors.slate50,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  headerText: {
    ...typography.tiny,
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    flex: 1,
    fontWeight: '700',
    fontSize: 11,
  },
  body: {
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate50,
    alignItems: 'center',
  },
});
