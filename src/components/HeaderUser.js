import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

// Header pill showing who you're signed in as. Read-only — identity is
// derived from your login, not chosen here.
export default function HeaderUser() {
  const { activeMember } = useApp();
  if (!activeMember) return null;

  return (
    <View style={styles.pill}>
      <View style={[styles.dot, { backgroundColor: activeMember.color }]} />
      <Text style={styles.text} numberOfLines={1}>{activeMember.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingVertical: 5,
    paddingHorizontal: 11,
    marginRight: 14,
    maxWidth: 150,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 7 },
  text: { color: colors.ink, fontWeight: '600', fontSize: 13 },
});
