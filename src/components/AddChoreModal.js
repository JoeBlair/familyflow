import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Eyebrow } from './ui';
import { DOMAINS, FREQUENCIES, domainLabels, domainColors, frequencyLabels, colors, fonts } from '../theme/colors';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

export default function AddChoreModal({ visible, defaultFrequency, frequencies = FREQUENCIES, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState(defaultFrequency || frequencies[0]);
  const [domain, setDomain] = useState('household');
  const [calSlot, setCalSlot] = useState(null); // null | 'morning' | 'afternoon'
  const [calDay, setCalDay] = useState(null);
  const [notes, setNotes] = useState('');
  const [intervalDays, setIntervalDays] = useState(3);

  React.useEffect(() => {
    if (visible) setFrequency(defaultFrequency && frequencies.includes(defaultFrequency) ? defaultFrequency : frequencies[0]);
  }, [visible, defaultFrequency]);

  const reset = () => { setTitle(''); setDomain('household'); setCalSlot(null); setCalDay(null); setNotes(''); setIntervalDays(3); };

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    // Daily tasks use only a slot (every day); weekly/yearly use day + slot.
    const calendar = frequency === 'daily'
      ? { calSlot, calDay: null }
      : { calSlot, calDay: calSlot ? calDay : null };
    onAdd({
      title: t, frequency, domain,
      notes: notes.trim() || undefined,
      intervalDays: frequency === 'custom' ? intervalDays : undefined,
      ...calendar,
    });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <View style={styles.sheet}>
          <Eyebrow>New chore</Eyebrow>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What needs doing?"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          <Text style={styles.label}>Frequency</Text>
          <View style={styles.chipRow}>
            {frequencies.map((f) => (
              <Pressable key={f} onPress={() => setFrequency(f)} style={[styles.chip, frequency === f && styles.chipInk]}>
                <Text style={[styles.chipText, frequency === f && styles.chipTextActive]}>{frequencyLabels[f]}</Text>
              </Pressable>
            ))}
          </View>

          {frequency === 'custom' && (
            <View style={styles.stepRow}>
              <Text style={styles.stepLabel}>Every</Text>
              <Pressable onPress={() => setIntervalDays(Math.max(1, intervalDays - 1))} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>−</Text>
              </Pressable>
              <Text style={styles.stepNum}>{intervalDays}</Text>
              <Pressable onPress={() => setIntervalDays(intervalDays + 1)} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>+</Text>
              </Pressable>
              <Text style={styles.stepLabel}>{intervalDays === 1 ? 'day' : 'days'}</Text>
            </View>
          )}

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {DOMAINS.map((d) => {
              const active = domain === d;
              return (
                <Pressable key={d} onPress={() => setDomain(d)} style={[styles.chip, active && { backgroundColor: domainColors[d], borderColor: domainColors[d] }]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{domainLabels[d]}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>When (optional)</Text>
          <View style={styles.chipRow}>
            {['morning', 'afternoon'].map((s) => (
              <Pressable
                key={s}
                onPress={() => setCalSlot(calSlot === s ? null : s)}
                style={[styles.chip, calSlot === s && styles.chipInk]}
              >
                <Text style={[styles.chipText, calSlot === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          {frequency !== 'daily' && calSlot && (
            <View style={[styles.chipRow, { marginTop: 8 }]}>
              {DAYS.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setCalDay(calDay === d ? null : d)}
                  style={[styles.dayChip, calDay === d && styles.chipInk]}
                >
                  <Text style={[styles.chipText, calDay === d && styles.chipTextActive]}>{DAY_LABEL[d]}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {frequency === 'daily' && calSlot && (
            <Text style={styles.hint}>Daily — shows every {calSlot} on the calendar.</Text>
          )}

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything to remember…"
            placeholderTextColor={colors.muted}
            style={styles.notes}
            multiline
          />

          <Pressable onPress={submit} style={[styles.addBtn, !title.trim() && { opacity: 0.4 }]} disabled={!title.trim()}>
            <Text style={styles.addBtnText}>Add chore</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0008' },
  backdropTap: { ...StyleSheet.absoluteFillObject },
  sheet: { backgroundColor: colors.bg, padding: 22, paddingBottom: 38 },
  input: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 14, fontSize: 18, color: colors.ink, marginTop: 14, marginBottom: 8 },
  notes: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.paper, padding: 12, minHeight: 56, fontSize: 15, color: colors.ink, textAlignVertical: 'top' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: colors.muted, marginTop: 18, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  stepLabel: { fontSize: 14, color: colors.charcoal },
  stepBtn: { width: 34, height: 34, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 20, color: colors.ink, marginTop: -2 },
  stepNum: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink, minWidth: 26, textAlign: 'center' },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  dayChip: { paddingVertical: 7, paddingHorizontal: 11, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  hint: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 8 },
  chipInk: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: colors.charcoal },
  chipTextActive: { color: colors.paper },
  addBtn: { backgroundColor: colors.ink, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  addBtnText: { color: colors.paper, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
});
