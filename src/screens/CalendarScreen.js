import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from 'react-native';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import AddChoreModal from '../components/AddChoreModal';
import MemberPickerModal from '../components/MemberPickerModal';
import { useApp } from '../context/AppContext';
import { taskIcon } from '../theme/icons';
import { colors, fonts } from '../theme/colors';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
const SLOTS = ['morning', 'afternoon'];

export default function CalendarScreen() {
  const { chores, members, scheduleChore, claimChore, addChore } = useApp();
  const [target, setTarget] = useState(null); // { day: string|null, slot }
  const [addOpen, setAddOpen] = useState(false);
  const [assignChore, setAssignChore] = useState(null); // chore being assigned

  const memberById = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);

  // daily tasks scheduled to a slot (shown every day)
  const dailyBySlot = (slot) =>
    chores.filter((c) => c.frequency === 'daily' && c.calSlot === slot);
  // weekly/yearly tasks scheduled to a specific day + slot
  const dayBySlot = (day, slot) =>
    chores.filter((c) => c.frequency !== 'daily' && c.calDay === day && c.calSlot === slot);

  // candidates to add into the tapped cell
  const candidates = useMemo(() => {
    if (!target) return [];
    if (target.day === null) return chores.filter((c) => c.frequency === 'daily');
    return chores.filter((c) => c.frequency !== 'daily');
  }, [target, chores]);

  const place = (chore) => {
    scheduleChore(chore.id, target.day, target.slot);
    setTarget(null);
  };

  const Cell = ({ day, slot, list }) => (
    <View style={styles.cell}>
      <Eyebrow color={colors.muted} style={styles.slotLabel}>{slot}</Eyebrow>
      <View style={styles.chips}>
        {list.map((c) => {
          const m = memberById[c.assignee];
          return (
            <Pressable
              key={c.id}
              onPress={() => setAssignChore(c)}
              onLongPress={() => scheduleChore(c.id, null, null)}
              delayLongPress={300}
              style={[styles.chip, { backgroundColor: m ? m.color : colors.muted }]}
            >
              <Text style={styles.chipIcon}>{taskIcon(c.title, c.domain)}</Text>
              <Text style={styles.chipText} numberOfLines={1}>{c.title}</Text>
            </Pressable>
          );
        })}
        <Pressable style={styles.addCell} onPress={() => setTarget({ day, slot })}>
          <Text style={styles.addCellText}>+</Text>
        </Pressable>
      </View>
    </View>
  );

  if (members.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Add family members and schedule some chores.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <Eyebrow>The Week</Eyebrow>
      <Masthead style={{ marginTop: 4 }}>Calendar</Masthead>
      <Text style={styles.dek}>Tap + to schedule a task, tap a task to assign it, hold to remove. Coloured by who's assigned.</Text>

      <Pressable style={styles.newBtn} onPress={() => setAddOpen(true)}>
        <Text style={styles.newBtnText}>+ New task</Text>
      </Pressable>

      {/* Every day (daily tasks) */}
      <Rule style={{ marginTop: 22 }} />
      <Text style={styles.day}>Every day</Text>
      {SLOTS.map((slot) => (
        <Cell key={`daily-${slot}`} day={null} slot={slot} list={dailyBySlot(slot)} />
      ))}

      {/* Mon–Sun (weekly/yearly tasks) */}
      {DAYS.map((day) => (
        <View key={day}>
          <Rule style={{ marginTop: 18 }} />
          <Text style={styles.day}>{DAY_LABEL[day]}</Text>
          {SLOTS.map((slot) => (
            <Cell key={`${day}-${slot}`} day={day} slot={slot} list={dayBySlot(day, slot)} />
          ))}
        </View>
      ))}

      {/* Legend */}
      <Rule style={{ marginTop: 22, marginBottom: 12 }} />
      <View style={styles.legend}>
        {members.map((m) => (
          <View key={m.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: m.color }]} />
            <Text style={styles.legendText}>{m.name}</Text>
          </View>
        ))}
      </View>

      {/* Assign a task to a member (so daily chores count toward mental load) */}
      <MemberPickerModal
        visible={!!assignChore}
        title={assignChore ? `Assign "${assignChore.title}"` : 'Assign'}
        members={members}
        value={assignChore?.assignee}
        onSelect={(id) => assignChore && claimChore(assignChore.id, id)}
        onClose={() => setAssignChore(null)}
      />

      {/* Create a new task (daily lives here now) */}
      <AddChoreModal
        visible={addOpen}
        defaultFrequency="daily"
        onClose={() => setAddOpen(false)}
        onAdd={({ title, frequency, domain, calDay, calSlot }) =>
          addChore({ title, frequency, domain, calDay, calSlot })
        }
      />

      {/* Task picker */}
      <Modal visible={!!target} transparent animationType="fade" onRequestClose={() => setTarget(null)}>
        <Pressable style={styles.backdrop} onPress={() => setTarget(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Eyebrow>
              Add to {target?.day ? DAY_LABEL[target.day] : 'every day'} · {target?.slot}
            </Eyebrow>
            <ScrollView style={{ maxHeight: 380, marginTop: 8 }}>
              {candidates.length === 0 && <Text style={styles.noneText}>No tasks of this type yet.</Text>}
              {candidates.map((c) => {
                const m = memberById[c.assignee];
                return (
                  <Pressable key={c.id} style={styles.pickRow} onPress={() => place(c)}>
                    <Text style={styles.pickIcon}>{taskIcon(c.title, c.domain)}</Text>
                    <Text style={styles.pickTitle} numberOfLines={1}>{c.title}</Text>
                    {m && <View style={[styles.pickDot, { backgroundColor: m.color }]} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  emptyWrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { fontSize: 15, color: colors.muted, fontStyle: 'italic', textAlign: 'center' },
  dek: { fontSize: 14, color: colors.charcoal, marginTop: 8, lineHeight: 20 },
  newBtn: { alignSelf: 'flex-start', marginTop: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.ink, paddingVertical: 9, paddingHorizontal: 16 },
  newBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.ink },
  day: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink, marginTop: 14, marginBottom: 4 },
  cell: { marginTop: 10 },
  slotLabel: { marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, maxWidth: 200 },
  chipIcon: { fontSize: 13, marginRight: 5 },
  chipText: { color: colors.paper, fontSize: 13, fontWeight: '600' },
  addCell: { width: 30, height: 30, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  addCellText: { color: colors.muted, fontSize: 18, marginTop: -2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: colors.charcoal },
  backdrop: { flex: 1, backgroundColor: '#0009', justifyContent: 'center', padding: 28 },
  sheet: { backgroundColor: colors.bg, padding: 20 },
  noneText: { color: colors.muted, fontStyle: 'italic', paddingVertical: 14 },
  pickRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  pickIcon: { fontSize: 18, marginRight: 12 },
  pickTitle: { flex: 1, fontFamily: fonts.serif, fontSize: 17, color: colors.ink },
  pickDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
});
