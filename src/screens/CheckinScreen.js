import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import { useApp } from '../context/AppContext';
import { taskIcon } from '../theme/icons';
import { weekKey, isChoreDone } from '../utils/periods';
import { colors, fonts } from '../theme/colors';

// The check-in is about visibility + appreciation, NOT grading each other.
// Done-state comes from the actual completion (lastCompletedPeriod), so no one
// marks whether a partner "did it" — they just say thank you. Thank-yous reuse
// the ratings table: a row with status 'done' = appreciated, 'undone' = taken
// back (so no schema migration is needed).
export default function CheckinScreen() {
  const { chores, members, ratings, activeMember, rateTask } = useApp();
  const thisWeek = weekKey();

  const weeklyFor = (mid) => chores.filter((c) => c.frequency === 'weekly' && c.assignee === mid);

  // my thank-you on a specific done task (active member as the one giving thanks)
  const myThanks = (choreId, rateeId) =>
    ratings.find(
      (r) => r.weekKey === thisWeek && r.choreId === choreId && r.raterId === activeMember?.id && r.rateeId === rateeId
    );
  // how many people thanked this task
  const thanksOn = (choreId, rateeId) =>
    ratings.filter((r) => r.weekKey === thisWeek && r.choreId === choreId && r.rateeId === rateeId && r.status === 'done').length;
  // total thanks a person received in a given week
  const thanksReceived = (mid, wk) =>
    ratings.filter((r) => r.weekKey === wk && r.rateeId === mid && r.status === 'done').length;

  const toggleThanks = (chore, rateeId, on) =>
    rateTask({
      weekKey: thisWeek,
      choreId: chore.id,
      choreTitle: chore.title,
      raterId: activeMember.id,
      rateeId,
      status: on ? 'undone' : 'done',
      stars: null,
    });

  const totalThisWeek = useMemo(
    () => ratings.filter((r) => r.weekKey === thisWeek && r.status === 'done').length,
    [ratings, thisWeek]
  );

  const pastWeeks = useMemo(() => {
    const weeks = [...new Set(ratings.map((r) => r.weekKey))].filter((w) => w !== thisWeek).sort().reverse();
    return weeks
      .map((wk) => ({ wk, total: ratings.filter((r) => r.weekKey === wk && r.status === 'done').length }))
      .filter((w) => w.total > 0);
  }, [ratings, thisWeek]);

  if (members.length === 0 || !activeMember) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Add family members to start the weekly check-in.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <Eyebrow>Weekly</Eyebrow>
      <Masthead style={{ marginTop: 4 }}>Check-in</Masthead>
      <Text style={styles.dek}>See what got done this week — and send a little appreciation for it.</Text>

      <View style={styles.sticker}>
        <Text style={styles.stickerEmoji}>💛</Text>
        <Text style={styles.stickerText}>
          {totalThisWeek === 0
            ? 'No thank-yous yet — tap a done task to appreciate whoever handled it.'
            : `${totalThisWeek} thank-you${totalThisWeek === 1 ? '' : 's'} shared this week.`}
        </Text>
      </View>

      {members.map((m) => {
        const tasks = weeklyFor(m.id);
        const isMe = m.id === activeMember.id;
        const received = thanksReceived(m.id, thisWeek);
        const doneCount = tasks.filter((t) => isChoreDone(t)).length;
        return (
          <View key={m.id}>
            <Rule style={{ marginTop: 22 }} />
            <View style={styles.personHead}>
              <Text style={[styles.person, { color: m.color }]}>{m.name}{isMe ? ' (you)' : ''}</Text>
              <Text style={styles.tally}>
                {doneCount}/{tasks.length} done{received > 0 ? ` · 💛 ${received}` : ''}
              </Text>
            </View>

            {tasks.length === 0 && <Text style={styles.noneText}>No weekly chores claimed.</Text>}

            {tasks.map((t) => {
              const done = isChoreDone(t);
              const count = thanksOn(t.id, m.id);
              const mine = myThanks(t.id, m.id)?.status === 'done';
              return (
                <View key={t.id} style={styles.taskRow}>
                  <Text style={[styles.taskIcon, !done && styles.dim]}>{taskIcon(t.title, t.domain)}</Text>
                  <View style={styles.taskMain}>
                    <Text style={[styles.taskTitle, !done && styles.taskTodo]} numberOfLines={1}>{t.title}</Text>
                    <Text style={styles.taskState}>{done ? 'Done this week' : 'Still to do'}</Text>
                  </View>

                  {isMe ? (
                    <Text style={styles.recTag}>{count > 0 ? `💛 ${count}` : ''}</Text>
                  ) : done ? (
                    <Pressable
                      onPress={() => toggleThanks(t, m.id, mine)}
                      style={[styles.thankBtn, mine && styles.thankOn]}
                    >
                      <Text style={[styles.thankText, mine && styles.thankTextOn]}>
                        {mine ? '💛 Thanked' : 'Appreciate'}
                      </Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.waiting}>—</Text>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      <Rule style={{ marginTop: 26, marginBottom: 14 }} />
      <Eyebrow color={colors.muted}>The week in thanks</Eyebrow>
      {pastWeeks.length === 0 ? (
        <Text style={styles.noneText}>Past weeks' appreciation will collect here.</Text>
      ) : (
        pastWeeks.map((s) => (
          <View key={s.wk} style={styles.shelfRow}>
            <Text style={styles.shelfHeart}>💛</Text>
            <Text style={styles.shelfWeek}>{s.wk}</Text>
            <Text style={styles.shelfCount}>{s.total} thank-you{s.total === 1 ? '' : 's'}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  emptyWrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { fontSize: 15, color: colors.muted, fontStyle: 'italic', textAlign: 'center' },
  dek: { fontSize: 14, color: colors.charcoal, marginTop: 8, lineHeight: 20 },
  sticker: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gold, padding: 14, marginTop: 18 },
  stickerEmoji: { fontSize: 24, marginRight: 12 },
  stickerText: { flex: 1, fontFamily: fonts.serif, fontSize: 17, color: colors.ink },
  personHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 14, marginBottom: 6 },
  person: { fontFamily: fonts.serif, fontSize: 22 },
  tally: { fontSize: 12, color: colors.muted, letterSpacing: 0.5 },
  noneText: { color: colors.muted, fontStyle: 'italic', paddingVertical: 8 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  taskIcon: { fontSize: 18, marginRight: 12 },
  dim: { opacity: 0.4 },
  taskMain: { flex: 1 },
  taskTitle: { fontSize: 16, color: colors.ink },
  taskTodo: { color: colors.muted },
  taskState: { fontSize: 11, color: colors.muted, marginTop: 2, letterSpacing: 0.3 },
  recTag: { fontSize: 13, color: colors.gold, fontWeight: '700' },
  waiting: { fontSize: 16, color: colors.line },
  thankBtn: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gold, paddingVertical: 7, paddingHorizontal: 12 },
  thankOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  thankText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: colors.gold },
  thankTextOn: { color: colors.paper },
  shelfRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  shelfHeart: { fontSize: 18, marginRight: 12 },
  shelfWeek: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink, width: 90 },
  shelfCount: { flex: 1, fontSize: 13, color: colors.charcoal, textAlign: 'right' },
});
