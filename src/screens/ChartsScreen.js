import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Doughnut, { DoughnutLegend } from '../components/Doughnut';
import LoadBar from '../components/LoadBar';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import { useApp } from '../context/AppContext';
import { DOMAINS, colors, fonts } from '../theme/colors';

const CHORE_LOAD_CAP = 10;

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

  // Daily mental load = number of daily chores each person carries.
  const dailyCount = (id) => chores.filter((c) => c.frequency === 'daily' && c.assignee === id).length;
  const maxDaily = Math.max(1, ...members.map((m) => dailyCount(m.id)));

  if (members.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Add family members to see the split.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <Eyebrow>The Division</Eyebrow>
      <Masthead style={{ marginTop: 4 }}>The Split</Masthead>
      <Text style={styles.dek}>Claimed chores by category, per person.</Text>

      {members.map((m, i) => (
        <View key={m.id}>
          <Rule style={{ marginTop: 22 }} />
          <Text style={[styles.person, { color: m.color }]}>{m.name}</Text>
          <View style={styles.doughnutWrap}>
            <Doughnut counts={countsByMember[m.id]} />
            <DoughnutLegend counts={countsByMember[m.id]} />
          </View>
        </View>
      ))}

      <Rule style={{ marginTop: 26, marginBottom: 18 }} />
      <Eyebrow>The Invisible Work</Eyebrow>
      <Masthead size={24} style={{ marginTop: 4 }}>Daily Mental Load</Masthead>
      <Text style={styles.dek}>The daily chores each person carries.</Text>
      {members.map((m) => {
        const count = dailyCount(m.id);
        return (
          <View key={m.id} style={styles.mlRow}>
            <View style={styles.mlHead}>
              <Text style={styles.loadName}>{m.name}</Text>
              <Text style={styles.mlCount}>{count} {count === 1 ? 'task' : 'tasks'} / day</Text>
            </View>
            <View style={styles.mlTrack}>
              <View style={[styles.mlFill, { width: `${(count / maxDaily) * 100}%`, backgroundColor: m.color }]} />
            </View>
          </View>
        );
      })}

      <Rule style={{ marginTop: 26, marginBottom: 18 }} />
      <Eyebrow>Engagements</Eyebrow>
      <Masthead size={24} style={{ marginTop: 4 }}>Paid Work</Masthead>
      <Text style={styles.dek}>How much of the week goes to paid work.</Text>
      {members.map((m) => (
        <View key={m.id} style={styles.workRow}>
          <Text style={styles.workName} numberOfLines={1}>{m.name}</Text>
          <Slider
            style={{ flex: 1, marginHorizontal: 12 }}
            minimumValue={0}
            maximumValue={100}
            step={5}
            value={m.workPct}
            onSlidingComplete={(v) => setMemberWork(m.id, Math.round(v))}
            minimumTrackTintColor={m.color}
            maximumTrackTintColor={colors.line}
            thumbTintColor={m.color}
          />
          <Text style={styles.workPct}>{m.workPct}%</Text>
        </View>
      ))}

      <Rule style={{ marginTop: 26, marginBottom: 18 }} />
      <Eyebrow>The Balance</Eyebrow>
      <Masthead size={24} style={{ marginTop: 4 }}>Combined Load</Masthead>
      <Text style={styles.dek}>Chores, paid work, and free time.</Text>
      {members.map((m) => {
        const workPct = m.workPct;
        const chorePct = Math.min(totalFor(m.id) / CHORE_LOAD_CAP, 1) * (100 - workPct);
        const freePct = Math.max(100 - workPct - chorePct, 0);
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { fontSize: 15, color: colors.muted, fontStyle: 'italic', textAlign: 'center' },
  dek: { fontSize: 14, color: colors.charcoal, marginTop: 8, lineHeight: 20 },
  person: { fontFamily: fonts.serif, fontSize: 22, marginTop: 16, marginBottom: 8 },
  doughnutWrap: { alignItems: 'center', marginTop: 8 },
  workRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  workName: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink, width: 90 },
  workPct: { fontSize: 13, fontWeight: '700', color: colors.ink, width: 42, textAlign: 'right' },
  loadRow: { marginTop: 18 },
  loadName: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink, marginBottom: 10 },
  mlRow: { marginTop: 16 },
  mlHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  mlCount: { fontSize: 12, color: colors.muted, letterSpacing: 0.5 },
  mlTrack: { height: 14, backgroundColor: colors.line },
  mlFill: { height: '100%' },
});
