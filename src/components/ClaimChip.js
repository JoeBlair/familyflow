import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';

// Editorial: a colour dot + name, or a hairline "Claim" outline when unassigned.
export default function ClaimChip({ member, onPress }) {
  const unassigned = !member;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && { opacity: 0.6 }]}
    >
      {unassigned ? (
        <Text style={styles.claim}>CLAIM</Text>
      ) : (
        <>
          <View style={[styles.dot, { backgroundColor: member.color }]} />
          <Text style={styles.name} numberOfLines={1}>{member.name}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', minWidth: 64, justifyContent: 'flex-end' },
  claim: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.gold,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
    paddingBottom: 1,
  },
  dot: { width: 9, height: 9, borderRadius: 5, marginRight: 6 },
  name: { fontSize: 14, color: colors.ink, fontWeight: '500', maxWidth: 96 },
});
