import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Doughnut, { DoughnutLegend } from '../components/Doughnut';
import LoadBar from '../components/LoadBar';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import { useApp } from '../context/AppContext';
import { DOMAINS, colors, fonts } from '../theme/colors';

const CHORE_LOAD_CAP = 10;
const FAIR_GAP = 15; // how close two people's load must be to count as "balanced"

export default function ChartsScreen() {
  const { members, chores, setMemberWork } = useApp();

  const countsByMember = useMemo(() => {
    const base = {};
    members.forEach((m) => {
      base[m.id] = { household: 0, baby: 0, admin: 0, social: 0 };
    });
    chores.forEach((c) => {
      if (c.assignee && base[c.assignee]) base[c.assignee][c.domain] += 1;
    });
    return base;
  }, [members, chores]);

  const totalFor = (id) => DOMAINS.reduce((s, d) => s + (countsByMember[id]?.[d] || 0), 0);

  // The work_pct column now stores paid-work DAYS per week (0–7). Clamp guards
  // any legacy values; convert to a share of the week for the balance maths.
  const workDaysOf = (m) => Math.max(0, Math.min(Number(m.workPct) || 0, 7));

  // Each person's week split into chores / paid work / free time.
  const loadFor = (m) => {
    const workPct = (workDaysOf(m) / 7) * 100;
    const chorePct = Math.min(totalFor(m.id) / CHORE_LOAD_CAP, 1) * (100 - workPct);
    const freePct = Math.max(100 - workPct - chorePct, 0);
    return { workPct, chorePct, freePct, busy: workPct + chorePct };
  };

  // The headline read: is the load fairly shared?
  const verdict = useMemo(() => {
    if (members.length < 2) {
      return 'Add another family member to see how the week is shared.';
    }
    const loads = members.map((m) => ({ m, busy: loadFor(m).busy }));
    const max = loads.reduce((a, b) => (b.busy > a.busy ? b : a));
    const min = loads.reduce((a, b) => (b.busy < a.busy ? b : a));
    if (max.busy - min.busy <= FAIR_GAP) return 'Looks fairly shared this week.';
    return 'A bit uneven this week — a good moment to check in with each other.';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, chores]);

  if (members.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Add family members to see how the load is shared.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      {/* HERO: the takeaway first — is it fair? */}
      <Eyebrow>The Balance</Eyebrow>
      <Masthead style={{ marginTop: 4 }}>How It Looks</Masthead>
      <Text style={styles.dek}>A rough shared picture from chores and paid work — for awareness and a chat, not a precise score.</Text>

      <View style={styles.verdict}>
        <Text style={styles.verdictEmoji}>💛</Text>
        <Text style={styles.verdictText}>{verdict}</Text>
      </View>

      {members.map((m) => {
        const { workPct, chorePct, freePct } = loadFor(m);
        return (
          <View key={m.id} style={styles.loadRow}>
            <Text style={styles.loadName}>{m.name}</Text>
            <LoadBar
              segments={[
                { label: 'Chores', value: chorePct, color: m.color },
                { label: 'Work', value: workPct, color: colors.ink },
                { label: 'Free', value: freePct, color: colors.sage },
              ]}
            />
          </View>
        );
      })}

      {/* Paid work — the input that drives the balance above */}
      <Rule style={{ marginTop: 28, marginBottom: 16 }} />
      <Eyebrow>Engagements</Eyebrow>
      <Masthead size={24} style={{ marginTop: 4 }}>Paid Work</Masthead>
      <Text style={styles.dek}>Set how many days a week each person works for pay — it feeds the balance above.</Text>
      {members.map((m) => {
        const days = workDaysOf(m);
        return (
          <View key={m.id} style={styles.workRow}>
            <Text style={styles.workName} numberOfLines={1}>{m.name}</Text>
            <Slider
              style={{ flex: 1, marginHorizontal: 12 }}
              minimumValue={0}
              maximumValue={7}
              step={1}
              value={days}
              onSlidingComplete={(v) => setMemberWork(m.id, Math.round(v))}
              minimumTrackTintColor={m.color}
              maximumTrackTintColor={colors.line}
              thumbTintColor={m.color}
            />
            <Text style={styles.workPct}>{days} {days === 1 ? 'day' : 'days'}</Text>
          </View>
        );
      })}

      {/* The detail: who does what, by category */}
      <Rule style={{ marginTop: 28, marginBottom: 16 }} />
      <Eyebrow>The Division</Eyebrow>
      <Masthead size={24} style={{ marginTop: 4 }}>Who Does What</Masthead>
      <Text style={styles.dek}>Claimed chores by category, per person.</Text>
      {members.map((m) => (
        <View key={m.id}>
          <Text style={[styles.person, { color: m.color }]}>{m.name}</Text>
          <View style={styles.doughnutWrap}>
            <Doughnut counts={countsByMember[m.id]} />
            <DoughnutLegend counts={countsByMember[m.id]} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { fontSize: 15, color: colors.muted, fontStyle: 'italic', textAlign: 'center' },
  dek: { fontSize: 14, color: colors.charcoal, marginTop: 8, lineHeight: 20 },
  verdict: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gold, padding: 14, marginTop: 16, marginBottom: 6 },
  verdictEmoji: { fontSize: 24, marginRight: 12 },
  verdictText: { flex: 1, fontFamily: fonts.serif, fontSize: 17, color: colors.ink, lineHeight: 23 },
  loadRow: { marginTop: 18 },
  loadName: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink, marginBottom: 10 },
  workRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  workName: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink, width: 90 },
  workPct: { fontSize: 13, fontWeight: '700', color: colors.ink, width: 58, textAlign: 'right' },
  person: { fontFamily: fonts.serif, fontSize: 22, marginTop: 20, marginBottom: 8 },
  doughnutWrap: { alignItems: 'center', marginTop: 8 },
});
