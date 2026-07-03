import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { FREQUENCIES, frequencyLabels, colors } from '../theme/colors';

// Editorial underline tabs. Horizontally scrollable so any number of
// frequencies fit without cramping.
export default function FrequencyTabs({ value, onChange, frequencies = FREQUENCIES }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexGrow: 1, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tab: { alignItems: 'center', paddingTop: 4, paddingHorizontal: 16 },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.muted,
    paddingBottom: 10,
  },
  textActive: { color: colors.ink },
  underline: { height: 2, width: '70%', backgroundColor: 'transparent' },
  underlineActive: { backgroundColor: colors.gold },
});
