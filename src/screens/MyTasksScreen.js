import React, { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import ChoreItem from '../components/ChoreItem';
import { Masthead, Eyebrow } from '../components/ui';
import { useApp } from '../context/AppContext';
import { isChoreDone } from '../utils/periods';
import { colors, fonts } from '../theme/colors';

const GROUPS = [
  { key: 'once', label: 'To-do' },
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: 'This week' },
  { key: 'monthly', label: 'This month' },
  { key: 'yearly', label: 'This year' },
  { key: 'custom', label: 'Every so often' },
];

export default function MyTasksScreen() {
  const { chores, activeMember } = useApp();

  const sections = useMemo(() => {
    if (!activeMember) return [];
    const mine = chores.filter((c) => c.assignee === activeMember.id);
    return GROUPS.map(({ key, label }) => {
      const data = mine.filter((c) => c.frequency === key);
      const done = data.filter((c) => isChoreDone(c)).length;
      return { key, label, done, total: data.length, data };
    }).filter((s) => s.total > 0);
  }, [chores, activeMember]);

  if (!activeMember) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sign in as a family member to see your list.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Eyebrow>Your tasks</Eyebrow>
        <Masthead style={{ marginTop: 4 }}>My List</Masthead>
        <Text style={styles.dek}>Everything assigned to {activeMember.name}. Tap the circle to tick it done.</Text>
      </View>

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Nothing's assigned to you yet. Claim a chore in Weekly or on the Calendar and it'll show up here.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{section.label}</Text>
              <Text style={styles.sectionCount}>{section.done}/{section.total} done</Text>
            </View>
          )}
          renderItem={({ item }) => <ChoreItem chore={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  dek: { fontSize: 14, color: colors.charcoal, marginTop: 8, lineHeight: 20 },
  empty: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 34 },
  emptyText: { fontSize: 15, color: colors.muted, fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 22, marginBottom: 2 },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  sectionCount: { fontSize: 12, color: colors.muted, letterSpacing: 0.5 },
});
