import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Masthead, Eyebrow } from '../components/ui';
import { colors, fonts } from '../theme/colors';

const { width } = Dimensions.get('window');

// The how-it-works walkthrough. Presentational: call onDone when finished or
// skipped. Used both as a one-time first-run intro (RootNavigator) and an
// on-demand "How it works" sheet (MembersScreen).
const CARDS = [
  {
    emoji: '🏡',
    eyebrow: 'Welcome',
    title: 'FamilyFlow',
    body: 'A calmer, more stylish way to share the running of your home. Here’s the quick tour.',
  },
  {
    emoji: '🗓️',
    eyebrow: 'Plan & share',
    title: 'Divide the week',
    body: 'In Weekly and Calendar, claim a chore for someone, tick it done, or add your own. Everyone’s list stays in sync, live.',
  },
  {
    emoji: '💛',
    eyebrow: 'See & appreciate',
    title: 'Notice the load',
    body: 'Charts show how the work is really split — including who carries each area in their head. The weekly Check-in lets you send a little thanks.',
  },
  {
    emoji: '🎮',
    eyebrow: 'Settle it',
    title: 'The Forfeit',
    body: 'There’s always one chore nobody wants. Can’t agree? Settle it with a quick head-to-head game — loser takes the task.',
  },
];

export default function IntroScreen({ onDone }) {
  const scroller = useRef(null);
  const [index, setIndex] = useState(0);
  const last = index === CARDS.length - 1;

  const onScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const next = () => {
    if (last) return onDone?.();
    scroller.current?.scrollTo({ x: (index + 1) * width, animated: true });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={() => onDone?.()} hitSlop={10}>
          <Text style={styles.skip}>{last ? '' : 'Skip'}</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {CARDS.map((c) => (
          <View key={c.title} style={[styles.card, { width }]}>
            <Text style={styles.emoji}>{c.emoji}</Text>
            <Eyebrow style={{ textAlign: 'center', marginBottom: 10 }}>{c.eyebrow}</Eyebrow>
            <Masthead size={36} style={styles.title}>{c.title}</Masthead>
            <Text style={styles.body}>{c.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {CARDS.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotOn]} />
        ))}
      </View>

      <Pressable onPress={next} style={styles.btn}>
        <Text style={styles.btnText}>{last ? 'Get started' : 'Next'}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { height: 40, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 24 },
  skip: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.muted },
  card: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: { textAlign: 'center' },
  body: { fontFamily: fonts.serif, fontSize: 18, color: colors.charcoal, textAlign: 'center', marginTop: 16, lineHeight: 27 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 18 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.line },
  dotOn: { backgroundColor: colors.gold },
  btn: { backgroundColor: colors.ink, marginHorizontal: 24, marginBottom: 24, paddingVertical: 17, alignItems: 'center' },
  btnText: { color: colors.paper, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
});
