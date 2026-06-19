import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import { useApp } from '../context/AppContext';
import { taskIcon } from '../theme/icons';
import { weekKey } from '../utils/periods';
import { colors, fonts } from '../theme/colors';

const STATUSES = [
  { key: 'done', label: 'Done', color: colors.sage },
  { key: 'undone', label: 'Undone', color: colors.muted },
  { key: 'not_completed', label: 'Not completed', color: '#9E5B6B' },
];
const STATUS_LABEL = { done: 'Done', undone: 'Undone', not_completed: 'Not completed' };

function Stars({ value, onChange, readOnly }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} disabled={readOnly} onPress={() => onChange?.(n)} hitSlop={3}>
          <Text style={[styles.star, n <= value ? styles.starOn : styles.starOff]}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

function StatusSelector({ value, onChange }) {
  return (
    <View style={styles.statusRow}>
      {STATUSES.map((s) => {
        const on = value === s.key;
        return (
          <Pressable
            key={s.key}
            onPress={() => onChange(s.key)}
            style={[styles.statusBtn, on && { backgroundColor: s.color, borderColor: s.color }]}
          >
            <Text style={[styles.statusText, on && { color: colors.paper }]}>{s.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function CheckinScreen() {
  const { chores, members, ratings, activeMember, rateTask } = useApp();
  const thisWeek = weekKey();

  // weekly chores only
  const weeklyFor = (mid) => chores.filter((c) => c.frequency === 'weekly' && c.assignee === mid);

  const scoreFor = (mid, wk) =>
    ratings
      .filter((r) => r.weekKey === wk && r.rateeId === mid && r.stars)
      .reduce((s, r) => s + r.stars, 0);

  // my rating row (active member as rater) for a task
  const myRating = (choreId, rateeId) =>
    ratings.find((r) => r.weekKey === thisWeek && r.choreId === choreId && r.raterId === activeMember?.id && r.rateeId === rateeId);
  // any rating received on a task (what others marked)
  const received = (choreId, rateeId) =>
    ratings.find((r) => r.weekKey === thisWeek && r.choreId === choreId && r.rateeId === rateeId && r.status);

  const setStatus = (chore, rateeId, status, existing) =>
    rateTask({
      weekKey: thisWeek, choreId: chore.id, choreTitle: chore.title,
      raterId: activeMember.id, rateeId, status,
      stars: status === 'done' ? existing?.stars ?? null : null,
    });
  const setStars = (chore, rateeId, stars) =>
    rateTask({
      weekKey: thisWeek, choreId: chore.id, choreTitle: chore.title,
      raterId: activeMember.id, rateeId, status: 'done', stars,
    });

  const weekScores = useMemo(() => members.map((m) => ({ m, score: scoreFor(m.id, thisWeek) })), [members, ratings, thisWeek]);
  const topScore = Math.max(0, ...weekScores.map((w) => w.score));
  const leaders = weekScores.filter((w) => w.score > 0 && w.score === topScore).map((w) => w.m);

  const shelf = useMemo(() => {
    const weeks = [...new Set(ratings.map((r) => r.weekKey))].filter((w) => w !== thisWeek).sort().reverse();
    return weeks.map((wk) => {
      const scores = members.map((m) => ({ m, score: scoreFor(m.id, wk) }));
      const top = Math.max(0, ...scores.map((s) => s.score));
      const winners = scores.filter((s) => s.score > 0 && s.score === top).map((s) => s.m);
      return { wk, winners, top };
    });
  }, [ratings, members, thisWeek]);

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
      <Text style={styles.dek}>Weekly chores only. Mark each one and rate the ones that got done. Top score earns the star.</Text>

      <View style={styles.sticker}>
        <Text style={styles.stickerEmoji}>🌟</Text>
        <Text style={styles.stickerText}>
          {leaders.length === 0
            ? 'No ratings yet this week — start below.'
            : leaders.length === 1
            ? `This week's star: ${leaders[0].name} (${topScore}★)`
            : `It's a tie: ${leaders.map((l) => l.name).join(' & ')} (${topScore}★)`}
        </Text>
      </View>

      {members.map((m) => {
        const tasks = weeklyFor(m.id);
        const isMe = m.id === activeMember.id;
        const score = scoreFor(m.id, thisWeek);
        return (
          <View key={m.id}>
            <Rule style={{ marginTop: 22 }} />
            <View style={styles.personHead}>
              <Text style={[styles.person, { color: m.color }]}>{m.name}{isMe ? ' (you)' : ''}</Text>
              <Text style={styles.tally}>{tasks.length} weekly · {score}★</Text>
            </View>

            {tasks.length === 0 && <Text style={styles.noneText}>No weekly chores claimed.</Text>}

            {tasks.map((t) => {
              const mine = myRating(t.id, m.id);
              const rec = received(t.id, m.id);
              return (
                <View key={t.id} style={styles.taskBlock}>
                  <View style={styles.taskRow}>
                    <Text style={styles.taskIcon}>{taskIcon(t.title, t.domain)}</Text>
                    <Text style={styles.taskTitle} numberOfLines={1}>{t.title}</Text>
                    {isMe && rec && (
                      <Text style={styles.recTag}>{STATUS_LABEL[rec.status]}{rec.stars ? ` · ${rec.stars}★` : ''}</Text>
                    )}
                  </View>

                  {!isMe && (
                    <>
                      <StatusSelector value={mine?.status} onChange={(s) => setStatus(t, m.id, s, mine)} />
                      {mine?.status === 'done' && (
                        <View style={styles.starsWrap}>
                          <Text style={styles.rateLabel}>Rate it</Text>
                          <Stars value={mine?.stars || 0} onChange={(n) => setStars(t, m.id, n)} />
                        </View>
                      )}
                    </>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      <Rule style={{ marginTop: 26, marginBottom: 14 }} />
      <Eyebrow color={colors.muted}>Trophy shelf</Eyebrow>
      {shelf.length === 0 ? (
        <Text style={styles.noneText}>Past weeks' winners will collect here.</Text>
      ) : (
        shelf.map((s) => (
          <View key={s.wk} style={styles.shelfRow}>
            <Text style={styles.shelfTrophy}>🏆</Text>
            <Text style={styles.shelfWeek}>{s.wk}</Text>
            <Text style={styles.shelfWinner}>{s.winners.map((w) => w.name).join(' & ')} · {s.top}★</Text>
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
  taskBlock: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  taskRow: { flexDirection: 'row', alignItems: 'center' },
  taskIcon: { fontSize: 18, marginRight: 12 },
  taskTitle: { flex: 1, fontSize: 16, color: colors.ink },
  recTag: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: colors.muted },
  statusRow: { flexDirection: 'row', gap: 6, marginTop: 10, marginLeft: 30 },
  statusBtn: { paddingVertical: 5, paddingHorizontal: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  statusText: { fontSize: 11, fontWeight: '600', color: colors.charcoal },
  starsWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 30 },
  rateLabel: { fontSize: 11, color: colors.muted, letterSpacing: 1, textTransform: 'uppercase', marginRight: 8 },
  stars: { flexDirection: 'row' },
  star: { fontSize: 20, marginLeft: 2 },
  starOn: { color: colors.gold },
  starOff: { color: colors.line },
  shelfRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  shelfTrophy: { fontSize: 18, marginRight: 12 },
  shelfWeek: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink, width: 90 },
  shelfWinner: { flex: 1, fontSize: 13, color: colors.charcoal, textAlign: 'right' },
});
