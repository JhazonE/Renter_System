import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DataTable, useTheme } from 'react-native-paper';
import { colors } from '../theme/colors';

export const Table = ({ headers, data, renderRow, columnFlex, onRowPress }) => {
  const theme = useTheme();

  return (
    <DataTable style={styles.container}>
      <DataTable.Header style={styles.header}>
        {headers.map((header, idx) => (
          <DataTable.Title 
            key={idx} 
            numeric={idx === headers.length - 1}
            textStyle={styles.headerText}
            style={columnFlex ? { flex: columnFlex[idx] } : {}}
          >
            {header}
          </DataTable.Title>
        ))}
      </DataTable.Header>

      {data.map((item, idx) => (
        <DataTable.Row 
          key={idx} 
          style={styles.row}
          onPress={onRowPress ? () => onRowPress(item) : undefined}
          rippleColor="rgba(0, 0, 0, 0.02)"
        >
          {renderRow(item)}
        </DataTable.Row>
      ))}
    </DataTable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.slate50,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
    height: 48,
  },
  headerText: {
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '800',
    fontSize: 10,
  },
  row: {
    borderBottomColor: colors.slate50,
    paddingVertical: 12, // Increased padding
    borderBottomWidth: 1,
  },
});
