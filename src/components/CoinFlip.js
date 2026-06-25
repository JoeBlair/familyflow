import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Eyebrow } from './ui';
import { colors, fonts } from '../theme/colors';

// A luck-based forfeit game: tap to flip, the coin decides. memberA / memberB
// are members; onWin({ winnerId, loserId }) fires when it lands.
export default function CoinFlip({ memberA, memberB, onWin, disabled }) {
  const [phase, setPhase] = useState('idle'); // idle | flipping | done
  const [winner, setWinner] = useState(null);
  const spin = useRef(new Animated.Value(0)).current;

  const flip = () => {
    if (disabled || phase === 'flipping') return;
    const winSide = Math.random() < 0.5 ? 'a' : 'b';
    const w = winSide === 'a' ? memberA : memberB;
    const l = winSide === 'a' ? memberB : memberA;
    setWinner(null);
    setPhase('flipping');
    spin.setValue(0);
    Animated.timing(spin, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setWinner(w);
      setPhase('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackStyle?.Success ?? 'success').catch(() => {});
      onWin({ winnerId: w.id, loserId: l.id });
    });
  };

  const rotateX = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1800deg'] });
  const coinColor = phase === 'done' && winner ? winner.color : colors.gold;
  const loser = winner ? (winner.id === memberA.id ? memberB : memberA) : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.status}>
        {phase === 'done' && winner ? (
          <>
            <Eyebrow color={colors.muted}>Heads it is</Eyebrow>
            <Text style={[styles.result, { color: winner.color }]}>{winner.emoji} {winner.name} wins</Text>
            <Text style={styles.sub}>{loser?.name} takes the chore</Text>
          </>
        ) : (
          <>
            <Eyebrow color={colors.muted}>The toss</Eyebrow>
            <Text style={styles.players}>{memberA.name} vs {memberB.name}</Text>
          </>
        )}
      </View>

      <Pressable onPress={flip} disabled={disabled || phase === 'flipping'} style={styles.coinWrap}>
        <Animated.View style={[styles.coin, { backgroundColor: coinColor, transform: [{ rotateX }] }]}>
          <Text style={styles.coinFace}>{phase === 'done' && winner ? winner.emoji : '★'}</Text>
        </Animated.View>
      </Pressable>

      <Pressable onPress={flip} disabled={disabled || phase === 'flipping'} style={[styles.btn, (disabled || phase === 'flipping') && { opacity: 0.5 }]}>
        <Text style={styles.btnText}>
          {phase === 'flipping' ? 'Flipping…' : phase === 'done' ? 'Flip again' : 'Flip the coin'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 8 },
  status: { alignItems: 'center', height: 66, justifyContent: 'center' },
  players: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink, marginTop: 4 },
  result: { fontFamily: fonts.serif, fontSize: 24, marginTop: 4 },
  sub: { fontSize: 13, color: colors.muted, fontStyle: 'italic', marginTop: 4 },
  coinWrap: { marginVertical: 22 },
  coin: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.paper },
  coinFace: { fontSize: 46 },
  btn: { backgroundColor: colors.ink, paddingVertical: 14, paddingHorizontal: 34, alignItems: 'center' },
  btnText: { color: colors.paper, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
});
