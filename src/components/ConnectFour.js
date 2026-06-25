import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../theme/colors';
import { Eyebrow } from './ui';

const ROWS = 6;
const COLS = 7;

const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

// Check whether `player` has 4-in-a-row through (r,c). Returns the winning cells or null.
function winningLine(board, r, c, player) {
  const dirs = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal ↘
    [1, -1], // diagonal ↙
  ];
  for (const [dr, dc] of dirs) {
    const line = [[r, c]];
    for (const sign of [1, -1]) {
      let rr = r + dr * sign;
      let cc = c + dc * sign;
      while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && board[rr][cc] === player) {
        line.push([rr, cc]);
        rr += dr * sign;
        cc += dc * sign;
      }
    }
    if (line.length >= 4) return line;
  }
  return null;
}

export default function ConnectFour({ memberA, memberB, onWin, disabled }) {
  const [board, setBoard] = useState(emptyBoard);
  const [turn, setTurn] = useState('a'); // 'a' | 'b'
  const [status, setStatus] = useState('playing'); // playing | won | draw
  const [winCells, setWinCells] = useState([]);
  const [winner, setWinner] = useState(null); // 'a' | 'b'

  const cell = useMemo(() => {
    const avail = Math.min(Dimensions.get('window').width - 32, 380);
    return Math.floor((avail - 8) / COLS);
  }, []);

  const memberFor = (k) => (k === 'a' ? memberA : memberB);
  const winKey = (r, c) => winCells.some(([wr, wc]) => wr === r && wc === c);

  const reset = () => {
    setBoard(emptyBoard());
    setTurn('a');
    setStatus('playing');
    setWinCells([]);
    setWinner(null);
  };

  const drop = (col) => {
    if (status !== 'playing' || disabled) return;
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) {
        row = r;
        break;
      }
    }
    if (row === -1) return; // column full

    const next = board.map((r) => r.slice());
    next[row][col] = turn;
    setBoard(next);
    Haptics.selectionAsync().catch(() => {});

    const line = winningLine(next, row, col, turn);
    if (line) {
      setWinCells(line);
      setWinner(turn);
      setStatus('won');
      // Optional-chain the enum: it can be undefined at runtime, and the throw
      // happens while evaluating the arg (uncaught) — which crashed on win.
      Haptics.notificationAsync(Haptics.NotificationFeedbackStyle?.Success ?? 'success').catch(() => {});
      const winId = memberFor(turn).id;
      const loseId = memberFor(turn === 'a' ? 'b' : 'a').id;
      onWin({ winnerId: winId, loserId: loseId });
      return;
    }
    if (next.every((r) => r.every((v) => v !== null))) {
      setStatus('draw');
      return;
    }
    setTurn(turn === 'a' ? 'b' : 'a');
  };

  const current = memberFor(turn);

  return (
    <View style={styles.wrap}>
      {/* Turn / result line */}
      <View style={styles.status}>
        {status === 'playing' ? (
          <>
            <Eyebrow color={colors.muted}>To play</Eyebrow>
            <Text style={[styles.turnName, { color: current.color }]}>
              {current.emoji} {current.name}
            </Text>
          </>
        ) : status === 'draw' ? (
          <Text style={styles.turnName}>A draw — play again</Text>
        ) : (
          <>
            <Eyebrow color={colors.muted}>Winner</Eyebrow>
            <Text style={[styles.turnName, { color: memberFor(winner).color }]}>
              {memberFor(winner).emoji} {memberFor(winner).name}
            </Text>
          </>
        )}
      </View>

      {/* Board */}
      <View style={styles.board}>
        {Array.from({ length: COLS }).map((_, c) => (
          <Pressable key={c} onPress={() => drop(c)} style={styles.col}>
            {Array.from({ length: ROWS }).map((__, r) => {
              const v = board[r][c];
              const m = v ? memberFor(v) : null;
              const won = winKey(r, c);
              return (
                <View key={r} style={[styles.cellBox, { width: cell, height: cell }]}>
                  <View
                    style={[
                      styles.disc,
                      { width: cell - 12, height: cell - 12 },
                      m ? { backgroundColor: m.color } : styles.discEmpty,
                      won && styles.discWon,
                    ]}
                  />
                </View>
              );
            })}
          </Pressable>
        ))}
      </View>

      {(status !== 'playing') && (
        <Pressable style={styles.replay} onPress={reset}>
          <Text style={styles.replayText}>NEW GAME</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  status: { alignItems: 'center', marginBottom: 14, height: 44, justifyContent: 'center' },
  turnName: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink, marginTop: 2 },
  board: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.ink,
  },
  col: { flexDirection: 'column' },
  cellBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  disc: { borderRadius: 999 },
  discEmpty: { backgroundColor: colors.ivory, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  discWon: { borderWidth: 2, borderColor: colors.gold },
  replay: {
    marginTop: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.ink,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  replayText: { fontSize: 12, fontWeight: '700', letterSpacing: 2, color: colors.ink },
});
