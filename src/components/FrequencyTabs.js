import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FREQUENCIES, frequencyLabels, colors } from '../theme/colors';

// Editorial underline tabs.
export default function FrequencyTabs({ value, onChange, frequencies = FREQUENCIES }) {
  return (
    <View style={styles.row}>
      {frequencies.map((f) => {
        const active = f === value;
        return (
          <Pressable key={f} onPress={() => onChange(f)} style={styles.tab}>
            <Text style={[styles.text, active && styles.textActive]}>
              {frequencyLabels[f]}
            </Text>
            <View style={[styles.underline, active && styles.underlineActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tab: { flex: 1, alignItems: 'center', paddingTop: 4 },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.muted,
    paddingBottom: 10,
  },
  textActive: { color: colors.ink },
  underline: { height: 2, width: '60%', backgroundColor: 'transparent' },
  underlineActive: { backgroundColor: colors.gold },
});
