import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { MEMBER_COLORS, MEMBER_EMOJIS, colors } from '../theme/colors';

export default function MemberEditor({ name, setName, color, setColor, emoji, setEmoji, namePlaceholder = 'Name' }) {
  return (
    <View>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={namePlaceholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Colour</Text>
      <View style={styles.row}>
        {MEMBER_COLORS.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]} />
        ))}
      </View>

      <Text style={styles.label}>Emoji</Text>
      <View style={styles.row}>
        {MEMBER_EMOJIS.map((e) => (
          <Pressable key={e} onPress={() => setEmoji(e)} style={[styles.emojiBtn, emoji === e && styles.emojiActive]}>
            <Text style={styles.emojiText}>{e}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 12, fontSize: 17, color: colors.ink },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: colors.muted, marginTop: 20, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: colors.ink },
  emojiBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  emojiActive: { borderColor: colors.gold, borderWidth: 1.5 },
  emojiText: { fontSize: 19 },
});
