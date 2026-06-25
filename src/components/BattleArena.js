import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import PixelSprite from './PixelSprite';
import { colors } from '../theme/colors';

const FIGHT_MS = 5000;
const TARGET_TAPS = 45;

// memberA / memberB: member objects. onFinish({ winnerId, loserId, scores })
// where scores is keyed by member id.
export default function BattleArena({ memberA, memberB, onFinish, disabled }) {
  const [phase, setPhase] = useState('idle'); // idle | countdown | fighting | done
  const [count, setCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(FIGHT_MS);
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const scoresRef = useRef({ a: 0, b: 0 });

  const aScale = useRef(new Animated.Value(1)).current;
  const bScale = useRef(new Animated.Value(1)).current;

  const timersRef = useRef([]);
  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.forEach(clearInterval);
    timersRef.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const start = () => {
    scoresRef.current = { a: 0, b: 0 };
    setScores({ a: 0, b: 0 });
    setTimeLeft(FIGHT_MS);
    setCount(3);
    setPhase('countdown');

    [3, 2, 1].forEach((n, i) =>
      timersRef.current.push(setTimeout(() => setCount(n), i * 700))
    );
    timersRef.current.push(
      setTimeout(() => {
        setPhase('fighting');
        const startedAt = Date.now();
        const tick = setInterval(() => {
          const left = FIGHT_MS - (Date.now() - startedAt);
          if (left <= 0) {
            clearInterval(tick);
            setTimeLeft(0);
            finish();
          } else {
            setTimeLeft(left);
          }
        }, 80);
        timersRef.current.push(tick);
      }, 3 * 700)
    );
  };

  const finish = () => {
    clearTimers();
    const s = scoresRef.current;
    let winSide;
    if (s.a === s.b) winSide = Math.random() < 0.5 ? 'a' : 'b';
    else winSide = s.a > s.b ? 'a' : 'b';
    const loseSide = winSide === 'a' ? 'b' : 'a';
    setPhase('done');
    onFinish({
      winnerId: winSide === 'a' ? memberA.id : memberB.id,
      loserId: loseSide === 'a' ? memberA.id : memberB.id,
      scores: { [memberA.id]: s.a, [memberB.id]: s.b },
    });
  };

  const tap = (side) => {
    if (phase !== 'fighting') return;
    scoresRef.current = { ...scoresRef.current, [side]: scoresRef.current[side] + 1 };
    setScores({ ...scoresRef.current });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle?.Light ?? 'light').catch(() => {});
    const scale = side === 'a' ? aScale : bScale;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.18, duration: 50, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();
  };

  const power = (side) => Math.min(scores[side] / TARGET_TAPS, 1);

  const renderSide = (member, side, flip, scale) => (
    <Pressable style={styles.side} onPress={() => tap(side)} disabled={phase !== 'fighting'}>
      <View style={styles.hpTrack}>
        <View style={[styles.hpFill, { width: `${power(side) * 100}%`, backgroundColor: member.color }]} />
      </View>
      <Text style={styles.scoreNum}>{scores[side]}</Text>
      <Animated.View style={{ transform: [{ scale }] }}>
        <PixelSprite skin={member.color} flip={flip} scale={2.2} />
      </Animated.View>
      <Text style={[styles.sideName, { color: member.color }]} numberOfLines={1}>
        {member.emoji} {member.name}
      </Text>
      {phase === 'fighting' && <Text style={styles.tapHint}>TAP!</Text>}
    </Pressable>
  );

  return (
    <View style={styles.arena}>
      <View style={styles.fighters}>
        {renderSide(memberA, 'a', false, aScale)}
        <View style={styles.vsWrap}>
          <Text style={styles.vs}>VS</Text>
        </View>
        {renderSide(memberB, 'b', true, bScale)}
      </View>

      {phase === 'idle' && (
        <Pressable style={[styles.cta, disabled && { opacity: 0.5 }]} onPress={start} disabled={disabled}>
          <Text style={styles.ctaText}>⚔️  Start Battle</Text>
        </Pressable>
      )}
      {phase === 'countdown' && (
        <View style={styles.statusBox}>
          <Text style={styles.countdown}>{count}</Text>
          <Text style={styles.getReady}>Get ready to tap your side!</Text>
        </View>
      )}
      {phase === 'fighting' && (
        <View style={styles.statusBox}>
          <Text style={styles.timer}>{(timeLeft / 1000).toFixed(1)}s</Text>
        </View>
      )}
      {phase === 'done' && (
        <Pressable style={styles.cta} onPress={start}>
          <Text style={styles.ctaText}>🔁  Rematch</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  arena: { backgroundColor: colors.dark, borderRadius: 20, padding: 16, paddingBottom: 18 },
  fighters: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  side: { flex: 1, alignItems: 'center' },
  vsWrap: { paddingHorizontal: 6, paddingBottom: 40 },
  vs: { color: colors.sand, fontWeight: '900', fontSize: 18 },
  hpTrack: { width: '88%', height: 12, borderRadius: 6, backgroundColor: '#ffffff22', overflow: 'hidden', marginBottom: 6 },
  hpFill: { height: '100%', borderRadius: 6 },
  scoreNum: { color: colors.white, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  sideName: { fontSize: 14, fontWeight: '800', marginTop: 8, maxWidth: 110 },
  tapHint: { color: colors.sand, fontSize: 12, fontWeight: '800', marginTop: 2 },
  cta: { backgroundColor: colors.gold, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  ctaText: { color: colors.white, fontSize: 17, fontWeight: '800' },
  statusBox: { alignItems: 'center', marginTop: 14 },
  countdown: { color: colors.sand, fontSize: 44, fontWeight: '900' },
  getReady: { color: colors.white, fontSize: 13, marginTop: 2 },
  timer: { color: colors.white, fontSize: 24, fontWeight: '900' },
});
