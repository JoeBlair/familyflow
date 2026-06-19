import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Doughnut, { DoughnutLegend } from '../components/Doughnut';
import LoadBar from '../components/LoadBar';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import { useApp } from '../context/AppContext';
import { DOMAINS, domainColors, domainLabels, colors, fonts } from '../theme/colors';

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

  // Mental load = who owns an area in their head. We proxy "ownership" by who
  // carries the most chores in each domain — the household's default for it.
  const areaStats = (d) => {
    const rows = members
      .map((m) => ({ m, count: countsByMember[m.id]?.[d] || 0 }))
      .filter((r) => r.count > 0);
    const total = rows.reduce((s, r) => s + r.count, 0);
    const top = [...rows].sort((a, b) => b.count - a.count)[0];
    return { rows, total, top };
  };

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
      <Masthead size={24} style={{ marginTop: 4 }}>Who Carries Each Area</Masthead>
      <Text style={styles.dek}>Mental load is about who owns an area in their head. This shows who holds the most in each — a nudge to share the defaults, not a scoreboard.</Text>
      {DOMAINS.map((d) => {
        const { rows, total, top } = areaStats(d);
        const caption = total === 0 ? 'No one yet' : top.count / total >= 0.6 ? `Mostly ${top.m.name}` : 'Shared';
        return (
          <View key={d} style={styles.areaRow}>
            <View style={styles.areaHead}>
              <View style={styles.areaLabelWrap}>
                <View style={[styles.areaDot, { backgroundColor: domainColors[d] }]} />
                <Text style={styles.areaLabel}>{domainLabels[d]}</Text>
              </View>
              <Text style={styles.areaCaption}>{caption}</Text>
            </View>
            <View style={styles.areaTrack}>
              {rows.map((r) => (
                <View key={r.m.id} style={{ flex: r.count, backgroundColor: r.m.color }} />
              ))}
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
      <Text style={styles.dek}>A rough shared picture of everyone's week — chores, paid work, and free time. Meant for awareness, not a precise score.</Text>
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
  areaRow: { marginTop: 16 },
  areaHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  areaLabelWrap: { flexDirection: 'row', alignItems: 'center' },
  areaDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  areaLabel: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink },
  areaCaption: { fontSize: 12, color: colors.muted, letterSpacing: 0.3 },
  areaTrack: { height: 14, backgroundColor: colors.line, flexDirection: 'row', overflow: 'hidden' },
});
