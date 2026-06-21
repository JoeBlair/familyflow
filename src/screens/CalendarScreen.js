import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from 'react-native';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import AddChoreModal from '../components/AddChoreModal';
import MemberPickerModal from '../components/MemberPickerModal';
import { useApp } from '../context/AppContext';
import { taskIcon } from '../theme/icons';
import { colors, fonts } from '../theme/colors';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_SHORT = { mon: 'Mo', tue: 'Tu', wed: 'We', thu: 'Th', fri: 'Fr', sat: 'Sa', sun: 'Su' };
const DAY_LABEL = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
// Only morning/afternoon until the DB cal_slot check constraint adds 'evening'.
const SLOTS = ['morning', 'afternoon'];
const SLOT_SHORT = { morning: 'Morn', afternoon: 'Aft' };
const DOTS_SHOWN = 4;

export default function CalendarScreen() {
  const { chores, members, scheduleChore, claimChore, addChore } = useApp();
  const [target, setTarget] = useState(null); // { day: string|null, slot } -> place-an-existing-task picker
  const [cell, setCell] = useState(null); // { day: string|null, slot } -> grid cell detail sheet
  const [addOpen, setAddOpen] = useState(false);
  const [assignChore, setAssignChore] = useState(null); // chore being assigned to a member

  const memberById = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);

  // daily tasks scheduled to a slot (shown every day) vs. day-specific weekly/yearly
  const dailyBySlot = (slot) => chores.filter((c) => c.frequency === 'daily' && c.calSlot === slot);
  const dayBySlot = (day, slot) => chores.filter((c) => c.frequency !== 'daily' && c.calDay === day && c.calSlot === slot);

  const tasksIn = (day, slot) => (day === null ? dailyBySlot(slot) : dayBySlot(day, slot));

  // candidates to drop into the tapped cell
  const candidates = useMemo(() => {
    if (!cell && !target) return [];
    const ctx = target || cell;
    if (ctx.day === null) return chores.filter((c) => c.frequency === 'daily');
    return chores.filter((c) => c.frequency !== 'daily');
  }, [cell, target, chores]);

  const place = (chore) => {
    scheduleChore(chore.id, target.day, target.slot);
    setTarget(null);
  };

  if (members.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Add family members and schedule some chores.</Text>
      </View>
    );
  }

  // A single grid cell: a stack of coloured dots (one per task, by assignee).
  const GridCell = ({ day, slot }) => {
    const list = tasksIn(day, slot);
    return (
      <Pressable style={styles.gridCell} onPress={() => setCell({ day, slot })}>
        <View style={styles.dots}>
          {list.slice(0, DOTS_SHOWN).map((c) => {
            const m = memberById[c.assignee];
            return <View key={c.id} style={[styles.dot, { backgroundColor: m ? m.color : colors.muted }]} />;
          })}
          {list.length > DOTS_SHOWN && <Text style={styles.more}>+{list.length - DOTS_SHOWN}</Text>}
        </View>
      </Pressable>
    );
  };

  const cellTasks = cell ? tasksIn(cell.day, cell.slot) : [];
  const cellTitle = cell ? `${cell.day ? DAY_LABEL[cell.day] : 'Every day'} · ${cell.slot}` : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <Eyebrow>The Week</Eyebrow>
      <Masthead style={{ marginTop: 4 }}>Calendar</Masthead>
      <Text style={styles.dek}>Tap any cell to see, add, assign or remove its tasks. Dots are coloured by who's assigned.</Text>

      <Pressable style={styles.newBtn} onPress={() => setAddOpen(true)}>
        <Text style={styles.newBtnText}>+ New task</Text>
      </Pressable>

      {/* Every day (daily tasks) — one full-width row per slot, above the day grid */}
      <Rule style={{ marginTop: 22 }} />
      <Text style={styles.section}>Every day</Text>
      {SLOTS.map((slot) => (
        <Pressable key={`daily-${slot}`} style={styles.dailyRow} onPress={() => setCell({ day: null, slot })}>
          <Text style={styles.dailyLabel} numberOfLines={1}>{SLOT_SHORT[slot]}</Text>
          <View style={styles.dailyChips}>
            {dailyBySlot(slot).length === 0 ? (
              <Text style={styles.dailyEmpty}>—</Text>
            ) : (
              dailyBySlot(slot).map((c) => {
                const m = memberById[c.assignee];
                return (
                  <View key={c.id} style={[styles.chip, { backgroundColor: m ? m.color : colors.muted }]}>
                    <Text style={styles.chipIcon}>{taskIcon(c.title, c.domain)}</Text>
                    <Text style={styles.chipText} numberOfLines={1}>{c.title}</Text>
                  </View>
                );
              })
            )}
          </View>
        </Pressable>
      ))}

      {/* Day-specific grid: 7 day columns × slot rows */}
      <Rule style={{ marginTop: 20 }} />
      <Text style={styles.section}>This week</Text>
      <View style={styles.grid}>
        {/* header row */}
        <View style={styles.gridHeader}>
          <View style={styles.rowLabel} />
          {DAYS.map((d) => (
            <View key={d} style={styles.headCell}>
              <Text style={styles.headText}>{DAY_SHORT[d]}</Text>
            </View>
          ))}
        </View>
        {/* slot rows */}
        {SLOTS.map((slot) => (
          <View key={slot} style={styles.gridRow}>
            <View style={styles.rowLabel}>
              <Text style={styles.rowLabelText}>{SLOT_SHORT[slot]}</Text>
            </View>
            {DAYS.map((d) => (
              <GridCell key={`${d}-${slot}`} day={d} slot={slot} />
            ))}
          </View>
        ))}
      </View>

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

      {/* Cell detail: tasks in this day+slot, with assign / remove / add */}
      <Modal visible={!!cell} transparent animationType="slide" onRequestClose={() => setCell(null)}>
        <Pressable style={styles.backdrop} onPress={() => setCell(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Eyebrow>{cellTitle}</Eyebrow>
            <View style={{ marginTop: 10, maxHeight: 360 }}>
              <ScrollView>
                {cellTasks.length === 0 && <Text style={styles.noneText}>Nothing scheduled here yet.</Text>}
                {cellTasks.map((c) => {
                  const m = memberById[c.assignee];
                  return (
                    <View key={c.id} style={styles.taskRow}>
                      <Text style={styles.taskIcon}>{taskIcon(c.title, c.domain)}</Text>
                      <Pressable style={styles.taskMain} onPress={() => setAssignChore(c)}>
                        <Text style={styles.taskTitle} numberOfLines={1}>{c.title}</Text>
                        <View style={styles.taskAssignee}>
                          <View style={[styles.assigneeDot, { backgroundColor: m ? m.color : colors.line }]} />
                          <Text style={styles.assigneeText}>{m ? m.name : 'Tap to assign'}</Text>
                        </View>
                      </Pressable>
                      <Pressable hitSlop={10} onPress={() => scheduleChore(c.id, null, null)}>
                        <Text style={styles.removeX}>✕</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
            <Pressable
              style={styles.addToCell}
              onPress={() => { setTarget(cell); setCell(null); }}
            >
              <Text style={styles.addToCellText}>+ Add a task here</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Assign a task to a member */}
      <MemberPickerModal
        visible={!!assignChore}
        title={assignChore ? `Assign "${assignChore.title}"` : 'Assign'}
        members={members}
        value={assignChore?.assignee}
        onSelect={(id) => assignChore && claimChore(assignChore.id, id)}
        onClose={() => setAssignChore(null)}
      />

      {/* Create a brand-new task (daily by default) */}
      <AddChoreModal
        visible={addOpen}
        defaultFrequency="daily"
        onClose={() => setAddOpen(false)}
        onAdd={({ title, frequency, domain, calDay, calSlot }) =>
          addChore({ title, frequency, domain, calDay, calSlot })
        }
      />

      {/* Place an existing task into the chosen cell */}
      <Modal visible={!!target} transparent animationType="fade" onRequestClose={() => setTarget(null)}>
        <Pressable style={styles.backdrop} onPress={() => setTarget(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Eyebrow>
              Add to {target?.day ? DAY_LABEL[target.day] : 'every day'} · {target?.slot}
            </Eyebrow>
            <ScrollView style={{ maxHeight: 380, marginTop: 8 }}>
              {candidates.length === 0 && <Text style={styles.noneText}>No tasks of this type yet — use “New task”.</Text>}
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
  section: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink, marginTop: 14, marginBottom: 8 },

  // every-day rows
  dailyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  dailyLabel: { width: 44, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.muted },
  dailyChips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  dailyEmpty: { color: colors.line, fontSize: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 9, borderRadius: 999, maxWidth: 180 },
  chipIcon: { fontSize: 12, marginRight: 4 },
  chipText: { color: colors.paper, fontSize: 12, fontWeight: '600' },

  // grid
  grid: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  gridHeader: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  gridRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowLabel: { width: 44, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.line },
  rowLabelText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.muted },
  headCell: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.line },
  headText: { fontSize: 11, fontWeight: '700', color: colors.charcoal, letterSpacing: 0.5 },
  gridCell: { flex: 1, minHeight: 46, paddingVertical: 6, paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.line },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5 },
  more: { fontSize: 9, color: colors.muted, fontWeight: '700' },

  // legend
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: colors.charcoal },

  // sheets
  backdrop: { flex: 1, backgroundColor: '#0009', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bg, padding: 22, paddingBottom: 38 },
  noneText: { color: colors.muted, fontStyle: 'italic', paddingVertical: 14 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  taskIcon: { fontSize: 18, marginRight: 12 },
  taskMain: { flex: 1 },
  taskTitle: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink },
  taskAssignee: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  assigneeDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  assigneeText: { fontSize: 12, color: colors.muted },
  removeX: { fontSize: 14, color: colors.muted, paddingLeft: 12 },
  addToCell: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.ink, paddingVertical: 13, alignItems: 'center', marginTop: 18 },
  addToCellText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.ink },

  pickRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  pickIcon: { fontSize: 18, marginRight: 12 },
  pickTitle: { flex: 1, fontFamily: fonts.serif, fontSize: 17, color: colors.ink },
  pickDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
});
