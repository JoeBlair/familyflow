import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Eyebrow } from './ui';
import { colors, fonts } from '../theme/colors';

const ROWS = 6;
const COLS = 5;
const MINES = 6;

const idx = (r, c) => r * COLS + c;

function buildBoard() {
  const cells = Array.from({ length: ROWS * COLS }, () => ({ mine: false, revealed: false, count: 0 }));
  let placed = 0;
  while (placed < MINES) {
    const i = Math.floor(Math.random() * cells.length);
    if (!cells[i].mine) { cells[i].mine = true; placed++; }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (cells[idx(r, c)].mine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const rr = r + dr, cc = c + dc;
          if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && cells[idx(rr, cc)].mine) n++;
        }
      }
      cells[idx(r, c)].count = n;
    }
  }
  return cells;
}

// Two-player forfeit minesweeper: players alternate revealing squares; whoever
// reveals a mine loses (and takes the chore). Numbers give it strategy.
export default function MineSweeper({ memberA, memberB, onWin, disabled }) {
  const [cells, setCells] = useState(buildBoard);
  const [turn, setTurn] = useState('a'); // 'a' | 'b'
  const [status, setStatus] = useState('playing'); // playing | over
  const [loser, setLoser] = useState(null);

  const size = useMemo(() => {
    const avail = Math.min(Dimensions.get('window').width - 32, 340);
    return Math.floor((avail - (COLS - 1) * 6) / COLS);
  }, []);

  const memberFor = (s) => (s === 'a' ? memberA : memberB);

  const reset = () => {
    setCells(buildBoard());
    setTurn('a');
    setStatus('playing');
    setLoser(null);
  };

  const tap = (i) => {
    if (status !== 'playing' || disabled || cells[i].revealed) return;
    const next = cells.map((c) => ({ ...c }));
    next[i].revealed = true;

    if (next[i].mine) {
      setCells(next);
      const loseSide = turn;
      const winSide = turn === 'a' ? 'b' : 'a';
      setLoser(loseSide);
      setStatus('over');
      Haptics.notificationAsync(Haptics.NotificationFeedbackStyle?.Error ?? 'error').catch(() => {});
      onWin({ winnerId: memberFor(winSide).id, loserId: memberFor(loseSide).id });
      return;
    }

    setCells(next);
    Haptics.selectionAsync().catch(() => {});
    // Board cleared without a mine (rare) — decide by coin toss.
    if (!next.some((c) => !c.mine && !c.revealed)) {
      const loseSide = Math.random() < 0.5 ? 'a' : 'b';
      setLoser(loseSide);
      setStatus('over');
      onWin({ winnerId: memberFor(loseSide === 'a' ? 'b' : 'a').id, loserId: memberFor(loseSide).id });
      return;
    }
    setTurn(turn === 'a' ? 'b' : 'a');
  };

  const current = memberFor(turn);

  return (
    <View style={styles.wrap}>
      <View style={styles.status}>
        {status === 'over' ? (
          <>
            <Eyebrow color={colors.muted}>Boom</Eyebrow>
            <Text style={[styles.head, { color: memberFor(loser).color }]}>
              {memberFor(loser).emoji} {memberFor(loser).name} hit a mine
            </Text>
            <Text style={styles.sub}>Takes the chore.</Text>
          </>
        ) : (
          <>
            <Eyebrow color={colors.muted}>To reveal</Eyebrow>
            <Text style={[styles.head, { color: current.color }]}>{current.emoji} {current.name}</Text>
            <Text style={styles.sub}>Pick a safe square. Hit a mine, you're stuck with it.</Text>
          </>
        )}
      </View>

      <View style={styles.board}>
        {Array.from({ length: ROWS }).map((_, r) => (
          <View key={r} style={styles.row}>
            {Array.from({ length: COLS }).map((__, c) => {
              const i = idx(r, c);
              const cell = cells[i];
              const show = cell.revealed || (status === 'over' && cell.mine);
              return (
                <Pressable
                  key={c}
                  onPress={() => tap(i)}
                  style={[styles.cell, { width: size, height: size }, show ? styles.cellOpen : styles.cellClosed]}
                >
                  {show ? (
                    cell.mine ? (
                      <Text style={styles.mine}>💣</Text>
                    ) : (
                      <Text style={styles.num}>{cell.count || ''}</Text>
                    )
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {status === 'over' && (
        <Pressable style={styles.replay} onPress={reset}>
          <Text style={styles.replayText}>NEW GAME</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  status: { alignItems: 'center', marginBottom: 14, minHeight: 62, justifyContent: 'center' },
  head: { fontFamily: fonts.serif, fontSize: 22, marginTop: 2 },
  sub: { fontSize: 12, color: colors.muted, marginTop: 4, textAlign: 'center' },
  board: { gap: 6 },
  row: { flexDirection: 'row', gap: 6 },
  cell: { alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  cellClosed: { backgroundColor: colors.ink },
  cellOpen: { backgroundColor: colors.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  num: { fontFamily: fonts.serif, fontSize: 18, color: colors.charcoal },
  mine: { fontSize: 18 },
  replay: { marginTop: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.ink, paddingVertical: 12, paddingHorizontal: 28 },
  replayText: { fontSize: 12, fontWeight: '700', letterSpacing: 2, color: colors.ink },
});
