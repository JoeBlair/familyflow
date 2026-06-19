import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import DomainBadge from './DomainBadge';
import ClaimChip from './ClaimChip';
import MemberPickerModal from './MemberPickerModal';
import { colors, fonts } from '../theme/colors';
import { taskIcon } from '../theme/icons';
import { isChoreDone } from '../utils/periods';
import { useApp } from '../context/AppContext';

export default function ChoreItem({ chore }) {
  const { members, toggleDone, claimChore, deleteChore } = useApp();
  const [picker, setPicker] = useState(false);
  const done = isChoreDone(chore);
  const assignedMember = members.find((m) => m.id === chore.assignee) || null;

  const onLongPress = () => {
    Alert.alert('Delete chore', `Remove "${chore.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteChore(chore.id) },
    ]);
  };

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={350} style={styles.row}>
      <Pressable
        onPress={() => toggleDone(chore)}
        hitSlop={10}
        style={[styles.check, done && styles.checkDone]}
      >
        {done && <Text style={styles.checkMark}>✓</Text>}
      </Pressable>

      <Text style={styles.icon}>{taskIcon(chore.title, chore.domain)}</Text>

      <View style={styles.middle}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
          {chore.title}
        </Text>
        <View style={styles.meta}>
          <DomainBadge domain={chore.domain} />
        </View>
      </View>

      <ClaimChip member={assignedMember} onPress={() => setPicker(true)} />

      <MemberPickerModal
        visible={picker}
        title="Who's doing this?"
        members={members}
        value={chore.assignee}
        onSelect={(memberId) => claimChore(chore.id, memberId)}
        onClose={() => setPicker(false)}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkDone: { backgroundColor: colors.ink, borderColor: colors.ink },
  checkMark: { color: colors.paper, fontSize: 13, fontWeight: '700' },
  icon: { fontSize: 20, marginRight: 12 },
  middle: { flex: 1, marginRight: 12 },
  title: { fontFamily: fonts.serif, fontSize: 19, color: colors.ink, marginBottom: 7 },
  titleDone: { color: colors.muted, textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row' },
});
