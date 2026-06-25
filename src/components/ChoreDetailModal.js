import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Eyebrow } from './ui';
import { useApp } from '../context/AppContext';
import { taskIcon } from '../theme/icons';
import { colors, fonts } from '../theme/colors';

let counter = 0;
const newId = () => `${Date.now()}_${counter++}`;

// A chore's detail sheet: free-form notes + a grocery-style checklist, plus
// delete. Notes save on blur; checklist items write through immediately so they
// sync. Local state is the source of truth while open (re-seeded per chore).
export default function ChoreDetailModal({ chore, visible, onClose }) {
  const { updateChore, deleteChore } = useApp();
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    if (visible) {
      setNotes(chore.notes || '');
      setItems(Array.isArray(chore.items) ? chore.items : []);
      setNewItem('');
    }
  }, [visible, chore.id]);

  const saveItems = (next) => {
    setItems(next);
    updateChore(chore.id, { items: next });
  };
  const addItem = () => {
    const t = newItem.trim();
    if (!t) return;
    saveItems([...items, { id: newId(), text: t, done: false }]);
    setNewItem('');
  };
  const toggleItem = (id) => saveItems(items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  const removeItem = (id) => saveItems(items.filter((it) => it.id !== id));

  const saveNotes = () => {
    if ((chore.notes || '') !== notes) updateChore(chore.id, { notes });
  };
  const close = () => {
    saveNotes();
    onClose();
  };
  const confirmDelete = () => {
    Alert.alert('Delete chore', `Remove “${chore.title}”?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { onClose(); deleteChore(chore.id); } },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Text style={styles.icon}>{taskIcon(chore.title, chore.domain)}</Text>
            <Text style={styles.title} numberOfLines={2}>{chore.title}</Text>
          </View>

          <Eyebrow color={colors.muted} style={styles.label}>Notes</Eyebrow>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            onEndEditing={saveNotes}
            placeholder="Add a note…"
            placeholderTextColor={colors.muted}
            multiline
            style={styles.notes}
          />

          <Eyebrow color={colors.muted} style={styles.label}>Checklist</Eyebrow>
          <ScrollView style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled">
            {items.length === 0 && <Text style={styles.none}>No items yet — add the first below.</Text>}
            {items.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <Pressable onPress={() => toggleItem(it.id)} style={[styles.box, it.done && styles.boxOn]}>
                  {it.done && <Text style={styles.boxTick}>✓</Text>}
                </Pressable>
                <Text style={[styles.itemText, it.done && styles.itemDone]} numberOfLines={2}>{it.text}</Text>
                <Pressable onPress={() => removeItem(it.id)} hitSlop={8}>
                  <Text style={styles.removeX}>✕</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <View style={styles.addRow}>
            <TextInput
              value={newItem}
              onChangeText={setNewItem}
              onSubmitEditing={addItem}
              placeholder="Add item…"
              placeholderTextColor={colors.muted}
              style={styles.addInput}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <Pressable onPress={addItem} style={[styles.addBtn, !newItem.trim() && { opacity: 0.4 }]} disabled={!newItem.trim()}>
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Pressable onPress={confirmDelete} style={styles.delete}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
            <Pressable onPress={close} style={styles.done}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0008' },
  sheet: { backgroundColor: colors.bg, padding: 22, paddingBottom: 36 },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { fontSize: 22, marginRight: 12 },
  title: { flex: 1, fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
  label: { marginTop: 18, marginBottom: 8 },
  notes: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.paper, padding: 12, minHeight: 64, fontSize: 15, color: colors.ink, textAlignVertical: 'top' },
  none: { color: colors.muted, fontStyle: 'italic', paddingVertical: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  box: { width: 22, height: 22, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  boxOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  boxTick: { color: colors.paper, fontSize: 13, fontWeight: '700' },
  itemText: { flex: 1, fontSize: 15, color: colors.ink },
  itemDone: { color: colors.muted, textDecorationLine: 'line-through' },
  removeX: { fontSize: 13, color: colors.muted, paddingLeft: 10 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  addInput: { flex: 1, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 10, fontSize: 15, color: colors.ink },
  addBtn: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.ink, paddingVertical: 9, paddingHorizontal: 16 },
  addBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: colors.ink },
  footer: { flexDirection: 'row', gap: 12, marginTop: 22 },
  delete: { paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: '#9E5B6B' },
  deleteText: { color: '#9E5B6B', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  done: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.ink },
  doneText: { color: colors.paper, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
});
