import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/colors';

// Large serif headline — the magazine masthead voice.
export function Masthead({ children, style, size = 30 }) {
  return <Text style={[styles.masthead, { fontSize: size }, style]}>{children}</Text>;
}

// Uppercase, wide-tracked label used like a magazine section header.
export function Eyebrow({ children, style, color = colors.gold }) {
  return <Text style={[styles.eyebrow, { color }, style]}>{children}</Text>;
}

// Hairline divider.
export function Rule({ style }) {
  return <View style={[styles.rule, style]} />;
}

const styles = StyleSheet.create({
  masthead: {
    fontFamily: fonts.serif,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
});
