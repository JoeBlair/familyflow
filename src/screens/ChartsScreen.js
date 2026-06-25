import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Doughnut, { DoughnutLegend } from '../components/Doughnut';
import LoadBar from '../components/LoadBar';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import { useApp } from '../context/AppContext';
import { DOMAINS, colors, fonts } from '../theme/colors';

const CHORE_LOAD_CAP = 10;
const FAIR_GAP = 15; // how close two people's load must be to count as "balanced"

export default function ChartsScreen() {
  const { members, chores } = useApp();

  // Charts is about the adults sharing the load — exclude children and home help.
  const fam = useMemo(() => members.filter((m) => m.role === 'member'), [members]);

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
    if (fam.length < 2) {
      return 'Add another family member to see how the week is shared.';
    }
    const loads = fam.map((m) => ({ m, busy: loadFor(m).busy }));
    const max = loads.reduce((a, b) => (b.busy > a.busy ? b : a));
    const min = loads.reduce((a, b) => (b.busy < a.busy ? b : a));
    if (max.busy - min.busy <= FAIR_GAP) return 'Looks fairly shared this week.';
    return 'A bit uneven this week — a good moment to check in with each other.';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fam, chores]);

  if (fam.length === 0) {
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
      <Text style={styles.dek}>A rough shared picture of each week — chores against the time someone's already out at work. For awareness and a chat, not a precise score.</Text>

      <View style={styles.verdict}>
        <Text style={styles.verdictEmoji}>💛</Text>
        <Text style={styles.verdictText}>{verdict}</Text>
      </View>

      {fam.map((m) => {
        const { workPct, chorePct, freePct } = loadFor(m);
        const days = workDaysOf(m);
        return (
          <View key={m.id} style={styles.loadRow}>
            <View style={styles.loadHead}>
              <Text style={styles.loadName}>{m.name}</Text>
              <Text style={styles.loadMeta}>out {days} {days === 1 ? 'day' : 'days'}/wk</Text>
            </View>
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
      <Text style={styles.tip}>Set each person's days at work when you add or edit them on the Family tab.</Text>

      {/* The detail: who does what, by category */}
      <Rule style={{ marginTop: 28, marginBottom: 16 }} />
      <Eyebrow>The Division</Eyebrow>
      <Masthead size={24} style={{ marginTop: 4 }}>Who Does What</Masthead>
      <Text style={styles.dek}>Claimed chores by category, per person.</Text>
      {fam.map((m) => (
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
  loadHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  loadName: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink },
  loadMeta: { fontSize: 12, color: colors.muted, letterSpacing: 0.3 },
  tip: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 16, lineHeight: 17 },
  person: { fontFamily: fonts.serif, fontSize: 22, marginTop: 20, marginBottom: 8 },
  doughnutWrap: { alignItems: 'center', marginTop: 8 },
});
