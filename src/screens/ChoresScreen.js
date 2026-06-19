import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import ChoreItem from '../components/ChoreItem';
import FrequencyTabs from '../components/FrequencyTabs';
import AddChoreModal from '../components/AddChoreModal';
import { Eyebrow } from '../components/ui';
import { useApp } from '../context/AppContext';
import { DOMAINS, domainLabels, domainColors, colors } from '../theme/colors';
import { isChoreDone } from '../utils/periods';

export default function ChoresScreen() {
  const { chores, addChore } = useApp();
  const [frequency, setFrequency] = useState('weekly');
  const [domainFilter, setDomainFilter] = useState(null);
  const [modal, setModal] = useState(false);

  // Daily chores live on the Calendar + Charts now; this tab is Weekly + Plans.
  const FREQS = ['weekly', 'yearly'];

  const visible = useMemo(
    () =>
      chores
        .filter((c) => c.frequency === frequency)
        .filter((c) => (domainFilter ? c.domain === domainFilter : true)),
    [chores, frequency, domainFilter]
  );

  const doneCount = visible.filter((c) => isChoreDone(c)).length;

  const onAdd = ({ title, frequency: f, domain, calDay, calSlot }) =>
    addChore({ title, frequency: f, domain, calDay, calSlot });

  return (
    <View style={styles.container}>
      <FrequencyTabs value={frequency} onChange={setFrequency} frequencies={FREQS} />

      <View style={styles.filterRow}>
        <FilterChip label="All" active={domainFilter === null} color={colors.ink} onPress={() => setDomainFilter(null)} />
        {DOMAINS.map((d) => (
          <FilterChip
            key={d}
            label={domainLabels[d]}
            active={domainFilter === d}
            color={domainColors[d]}
            onPress={() => setDomainFilter(domainFilter === d ? null : d)}
          />
        ))}
      </View>

      <Eyebrow color={colors.muted} style={styles.progress}>
        {doneCount} of {visible.length} complete
      </Eyebrow>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChoreItem chore={item} />}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Nothing here.</Text>}
      />

      <Pressable style={styles.fab} onPress={() => setModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <AddChoreModal visible={modal} defaultFrequency={frequency} frequencies={FREQS} onClose={() => setModal(false)} onAdd={onAdd} />
    </View>
  );
}

function FilterChip({ label, active, color, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.filterChip, active && { borderColor: color, backgroundColor: color }]}>
      <Text style={[styles.filterText, active && { color: colors.paper }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 6 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  filterText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.charcoal },
  progress: { marginTop: 18, marginBottom: 2 },
  empty: { fontSize: 15, color: colors.muted, fontStyle: 'italic', marginTop: 40, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 26,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: colors.paper, fontSize: 30, fontWeight: '300', marginTop: -3 },
});
