import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Masthead, Eyebrow } from '../components/ui';
import { useApp } from '../context/AppContext';
import { SUGGESTED_CHORES } from '../data/suggestedChores';
import { DOMAINS, domainColors, domainLabels, frequencyLabels, colors, fonts } from '../theme/colors';

// First-run picker: choose which suggested chores apply to this family, instead
// of auto-seeding a fixed list. Shown once (gated in RootNavigator). Skipping is
// fine — chores can be added anytime from Weekly / Calendar.
export default function ChoreSetupScreen({ onDone }) {
  const { addChores } = useApp();
  const [selected, setSelected] = useState(
    () => new Set(SUGGESTED_CHORES.map((c, i) => (c.defaultOn ? i : null)).filter((i) => i !== null))
  );
  const [busy, setBusy] = useState(false);

  const byDomain = useMemo(() => {
    const groups = {};
    SUGGESTED_CHORES.forEach((c, i) => {
      (groups[c.domain] = groups[c.domain] || []).push({ ...c, i });
    });
    return groups;
  }, []);

  const toggle = (i) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const finish = async () => {
    const list = [...selected].map((i) => SUGGESTED_CHORES[i]);
    if (list.length) {
      setBusy(true);
      await addChores(list);
      setBusy(false);
    }
    onDone?.();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Eyebrow>Welcome</Eyebrow>
        <Masthead style={{ marginTop: 4 }}>Set up your chores</Masthead>
        <Text style={styles.dek}>Tick the ones your family actually does. You can add, edit, or remove any of them later.</Text>

        {DOMAINS.map((d) => (
          <View key={d} style={{ marginTop: 22 }}>
            <View style={styles.domainHead}>
              <View style={[styles.domainDot, { backgroundColor: domainColors[d] }]} />
              <Text style={styles.domainLabel}>{domainLabels[d]}</Text>
            </View>
            {(byDomain[d] || []).map((c) => {
              const on = selected.has(c.i);
              return (
                <Pressable key={c.i} style={styles.row} onPress={() => toggle(c.i)}>
                  <View style={[styles.box, on && styles.boxOn]}>
                    {on && <Text style={styles.tick}>✓</Text>}
                  </View>
                  <Text style={[styles.title, !on && styles.titleOff]} numberOfLines={1}>{c.title}</Text>
                  <Text style={styles.freq}>{frequencyLabels[c.frequency]}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
        <View style={{ height: 12 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => onDone?.()} style={styles.skip} disabled={busy}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        <Pressable onPress={finish} style={[styles.add, busy && { opacity: 0.5 }]} disabled={busy}>
          <Text style={styles.addText}>
            {busy ? 'Adding…' : selected.size ? `Add ${selected.size} chore${selected.size === 1 ? '' : 's'}` : 'Start empty'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 22, paddingBottom: 24 },
  dek: { fontSize: 14, color: colors.charcoal, marginTop: 8, lineHeight: 20 },
  domainHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  domainDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  domainLabel: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  box: { width: 22, height: 22, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  boxOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  tick: { color: colors.paper, fontSize: 13, fontWeight: '700' },
  title: { flex: 1, fontSize: 16, color: colors.ink },
  titleOff: { color: colors.muted },
  freq: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, marginLeft: 10 },
  footer: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, backgroundColor: colors.bg },
  skip: { paddingVertical: 16, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  skipText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.charcoal },
  add: { flex: 1, paddingVertical: 16, alignItems: 'center', backgroundColor: colors.ink },
  addText: { color: colors.paper, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
});
