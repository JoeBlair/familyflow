import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { MEMBER_COLORS, MEMBER_EMOJIS, ROLES, roleLabels, colors } from '../theme/colors';

export default function MemberEditor({
  name, setName, color, setColor, emoji, setEmoji,
  role, setRole, showRole = false,
  workDays, setWorkDays, showWork = false,
  namePlaceholder = 'Name',
}) {
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

      {showRole && (
        <>
          <Text style={styles.label}>Type</Text>
          <View style={styles.row}>
            {ROLES.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={[styles.roleChip, role === r && styles.roleChipActive]}
              >
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{roleLabels[r]}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

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

      {showWork && role === 'member' && (
        <>
          <Text style={styles.label}>Days out a week</Text>
          <Text style={styles.hint}>Work, study, or other commitments — so the balance knows you have less time for chores.</Text>
          <View style={[styles.row, { marginTop: 10 }]}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
              <Pressable key={n} onPress={() => setWorkDays(n)} style={[styles.dayNum, workDays === n && styles.dayNumOn]}>
                <Text style={[styles.dayNumText, workDays === n && styles.dayNumTextOn]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
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
  roleChip: { paddingVertical: 8, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  roleChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  roleText: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: colors.charcoal },
  roleTextActive: { color: colors.paper },
  hint: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 6, lineHeight: 17 },
  dayNum: { width: 32, height: 32, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  dayNumOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  dayNumText: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  dayNumTextOn: { color: colors.paper },
});
