import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import DomainBadge from './DomainBadge';
import ClaimChip from './ClaimChip';
import MemberPickerModal from './MemberPickerModal';
import ChoreDetailModal from './ChoreDetailModal';
import { colors, fonts, cadenceLabel } from '../theme/colors';
import { taskIcon } from '../theme/icons';
import { isChoreDone } from '../utils/periods';
import { useApp } from '../context/AppContext';

export default function ChoreItem({ chore }) {
  const { members, toggleDone, claimChore } = useApp();
  const [picker, setPicker] = useState(false);
  const [detail, setDetail] = useState(false);
  const done = isChoreDone(chore);
  const assignedMember = members.find((m) => m.id === chore.assignee) || null;

  const items = Array.isArray(chore.items) ? chore.items : [];
  const itemsDone = items.filter((it) => it.done).length;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => toggleDone(chore)}
        hitSlop={10}
        style={[styles.check, done && styles.checkDone]}
      >
        {done && <Text style={styles.checkMark}>✓</Text>}
      </Pressable>

      {/* Tap the body to open notes / checklist / delete */}
      <Pressable style={styles.body} onPress={() => setDetail(true)}>
        <Text style={styles.icon}>{taskIcon(chore.title, chore.domain)}</Text>
        <View style={styles.middle}>
          <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
            {chore.title}
          </Text>
          <View style={styles.meta}>
            <DomainBadge domain={chore.domain} />
            {chore.frequency === 'custom' && <Text style={styles.metaTag}>{cadenceLabel(chore)}</Text>}
            {!!chore.notes && <Text style={styles.metaTag}>📝</Text>}
            {items.length > 0 && <Text style={styles.metaTag}>☑ {itemsDone}/{items.length}</Text>}
          </View>
        </View>
      </Pressable>

      <ClaimChip member={assignedMember} onPress={() => setPicker(true)} />

      <MemberPickerModal
        visible={picker}
        title="Who's doing this?"
        members={members}
        value={chore.assignee}
        onSelect={(memberId) => claimChore(chore.id, memberId)}
        onClose={() => setPicker(false)}
      />

      <ChoreDetailModal chore={chore} visible={detail} onClose={() => setDetail(false)} />
    </View>
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
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 20, marginRight: 12 },
  middle: { flex: 1 },
  title: { fontFamily: fonts.serif, fontSize: 19, color: colors.ink, marginBottom: 7 },
  titleDone: { color: colors.muted, textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaTag: { fontSize: 11, color: colors.muted, fontWeight: '600' },
});
