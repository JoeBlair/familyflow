import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { domainColors, domainLabels } from '../theme/colors';

// Editorial: a small colour tick + uppercase tracked label, no pill.
export default function DomainBadge({ domain }) {
  return (
    <View style={styles.row}>
      <View style={[styles.tick, { backgroundColor: domainColors[domain] }]} />
      <Text style={[styles.label, { color: domainColors[domain] }]}>{domainLabels[domain]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  tick: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
});
