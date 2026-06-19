import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Eyebrow } from './ui';
import { colors, fonts } from '../theme/colors';

export default function MemberPickerModal({
  visible,
  title = 'Assign to',
  members,
  value,
  allowUnassign = true,
  onSelect,
  onClose,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Eyebrow>{title}</Eyebrow>
          <View style={{ height: 8 }} />

          {allowUnassign && (
            <Row label="Unassigned" color={colors.muted} selected={!value} onPress={() => { onSelect(null); onClose(); }} />
          )}
          {members.map((m) => (
            <Row key={m.id} label={m.name} color={m.color} selected={value === m.id} onPress={() => { onSelect(m.id); onClose(); }} />
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Row({ label, color, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.5 }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.rowLabel}>{label}</Text>
      {selected && <Text style={styles.check}>✓</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#0009', alignItems: 'center', justifyContent: 'center', padding: 30 },
  sheet: { width: '100%', backgroundColor: colors.bg, padding: 22 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  rowLabel: { flex: 1, fontFamily: fonts.serif, fontSize: 19, color: colors.ink },
  check: { fontSize: 16, fontWeight: '800', color: colors.gold },
});
