import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// segments: [{ label, value (0-100), color }]
export default function LoadBar({ segments }) {
  return (
    <View>
      <View style={styles.bar}>
        {segments.map((s, i) =>
          s.value > 0 ? (
            <View
              key={s.label}
              style={{ flex: s.value, backgroundColor: s.color }}
            />
          ) : null
        )}
      </View>
      <View style={styles.legend}>
        {segments.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>
              {s.label} {Math.round(s.value)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 14,
    overflow: 'hidden',
    backgroundColor: colors.line,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 10, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '600' },
});
