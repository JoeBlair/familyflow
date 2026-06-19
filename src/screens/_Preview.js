import React from 'react';
import { ScrollView } from 'react-native';
import ConnectFour from '../components/ConnectFour';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import { colors } from '../theme/colors';

// Throwaway visual preview of the Connect Four board (not wired into navigation).
const A = { id: 'a', name: 'Laura', color: '#6E668F', emoji: '👩' };
const B = { id: 'b', name: 'Joe', color: '#9C7A3C', emoji: '👨' };

export default function Preview() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Eyebrow>The Forfeit</Eyebrow>
      <Masthead style={{ marginTop: 4 }}>Settle the Score</Masthead>
      <Rule style={{ marginVertical: 16 }} />
      <ConnectFour memberA={A} memberB={B} onWin={() => {}} disabled={false} />
    </ScrollView>
  );
}
