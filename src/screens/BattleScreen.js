import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import ConnectFour from '../components/ConnectFour';
import MemberPickerModal from '../components/MemberPickerModal';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import { useApp } from '../context/AppContext';
import { weekKey } from '../utils/periods';
import { colors, fonts } from '../theme/colors';

export default function BattleScreen() {
  const { chores, members, family, setWeeklyStake, claimChore, addBattle, battles } = useApp();
  const thisWeek = weekKey();

  // Family + children can play the forfeit; home help is excluded.
  const players = useMemo(() => members.filter((m) => m.role !== 'helper'), [members]);

  const memberById = useMemo(() => {
    const m = {};
    members.forEach((x) => (m[x.id] = x));
    return m;
  }, [members]);

  const [fighterA, setFighterA] = useState(null);
  const [fighterB, setFighterB] = useState(null);
  const [picking, setPicking] = useState(null);

  useEffect(() => {
    if (players.length >= 2) {
      if (!fighterA || !memberById[fighterA]) setFighterA(players[0].id);
      if (!fighterB || !memberById[fighterB] || fighterB === fighterA) {
        const other = players.find((m) => m.id !== (fighterA || players[0].id));
        if (other) setFighterB(other.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  const stake = family?.weeklyStake;
  useEffect(() => {
    if (!family) return;
    if (stake && stake.weekKey === thisWeek) return;
    const pool = chores.filter((c) => !c.assignee);
    const source = pool.length ? pool : chores;
    if (!source.length) return;
    const pick = source[Math.floor(Math.random() * source.length)];
    setWeeklyStake({ weekKey: thisWeek, choreId: pick.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thisWeek, family?.id, stake?.weekKey, chores.length]);

  const stakeChore = useMemo(
    () => (stake ? chores.find((c) => c.id === stake.choreId) : null),
    [stake, chores]
  );

  const onWin = ({ winnerId, loserId }) => {
    if (stakeChore) claimChore(stakeChore.id, loserId);
    addBattle({
      weekKey: thisWeek,
      stakeChoreTitle: stakeChore ? stakeChore.title : '—',
      winner: winnerId,
      loser: loserId,
      scores: null,
    });
  };

  if (players.length < 2) {
    return (
      <View style={styles.emptyWrap}>
        <Masthead size={26}>Two to play</Masthead>
        <Text style={styles.emptyText}>Add at least two family members to settle a forfeit.</Text>
      </View>
    );
  }

  const a = memberById[fighterA];
  const b = memberById[fighterB];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <Eyebrow>The Forfeit</Eyebrow>
      <Masthead style={{ marginTop: 4 }}>Settle the Score</Masthead>
      <Text style={styles.dek}>One game of Connect Four. The loser takes the chore nobody wants.</Text>

      <Rule style={{ marginVertical: 18 }} />

      {/* Stake */}
      <Eyebrow color={colors.muted}>This week's stake</Eyebrow>
      <Masthead size={24} style={{ marginTop: 6 }}>
        {stakeChore ? stakeChore.title : 'No chore left'}
      </Masthead>
      {stakeChore && (
        <Text style={styles.stakeMeta}>
          {stakeChore.assignee && memberById[stakeChore.assignee]
            ? `Now with ${memberById[stakeChore.assignee].name}`
            : 'Unclaimed — play for it.'}
        </Text>
      )}

      {/* Players */}
      <View style={styles.pickRow}>
        <FighterPick member={a} onPress={() => setPicking('a')} />
        <Text style={styles.versus}>versus</Text>
        <FighterPick member={b} onPress={() => setPicking('b')} />
      </View>

      <Rule style={{ marginVertical: 18 }} />

      {a && b && a.id !== b.id ? (
        <ConnectFour key={`${a.id}-${b.id}`} memberA={a} memberB={b} onWin={onWin} disabled={!stakeChore} />
      ) : (
        <Text style={styles.pickHint}>Choose two different players.</Text>
      )}

      <Rule style={{ marginVertical: 22 }} />

      <Eyebrow color={colors.muted}>The Record</Eyebrow>
      {battles.length === 0 ? (
        <Text style={styles.emptyHist}>No games played yet.</Text>
      ) : (
        battles.map((bt, i) => {
          const loser = memberById[bt.loser];
          return (
            <View key={bt.id}>
              {i > 0 && <Rule />}
              <View style={styles.histRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histTitle}>
                    {loser ? `${loser.name} lost` : 'Someone lost'}
                  </Text>
                  <Text style={styles.histChore}>{bt.stakeChoreTitle}</Text>
                </View>
                <Text style={styles.histDate}>{formatDate(bt.date)}</Text>
              </View>
            </View>
          );
        })
      )}

      <MemberPickerModal
        visible={!!picking}
        title="Choose player"
        members={players}
        value={picking === 'a' ? fighterA : fighterB}
        allowUnassign={false}
        onSelect={(id) => {
          if (picking === 'a') {
            setFighterA(id);
            if (id === fighterB) setFighterB(players.find((m) => m.id !== id)?.id || fighterB);
          } else {
            setFighterB(id);
            if (id === fighterA) setFighterA(players.find((m) => m.id !== id)?.id || fighterA);
          }
        }}
        onClose={() => setPicking(null)}
      />
    </ScrollView>
  );
}

function FighterPick({ member, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.fighterChip}>
      <View style={[styles.fighterDot, { backgroundColor: member?.color || colors.muted }]} />
      <Text style={styles.fighterText} numberOfLines={1}>
        {member ? member.name : 'Pick'}
      </Text>
    </Pressable>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Manual formatting — Hermes (RN's engine) doesn't reliably support
// toLocaleDateString with options, which crashed the app on the first win.
function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  emptyWrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 8 },
  dek: { fontSize: 14, color: colors.charcoal, marginTop: 8, lineHeight: 20 },
  stakeMeta: { fontSize: 13, color: colors.muted, marginTop: 6, fontStyle: 'italic' },
  pickRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 14 },
  fighterChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.ink, paddingVertical: 11, paddingHorizontal: 10 },
  fighterDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  fighterText: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink },
  versus: { fontSize: 12, fontStyle: 'italic', color: colors.muted },
  pickHint: { textAlign: 'center', color: colors.muted, marginVertical: 20 },
  emptyHist: { fontSize: 14, color: colors.muted, marginTop: 10 },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  histTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink },
  histChore: { fontSize: 13, color: colors.muted, marginTop: 3 },
  histDate: { fontSize: 12, color: colors.muted, letterSpacing: 0.5 },
});
