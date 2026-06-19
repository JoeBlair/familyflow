import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MemberEditor from '../components/MemberEditor';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import { useApp } from '../context/AppContext';
import { MEMBER_COLORS, colors } from '../theme/colors';

export default function OnboardingScreen() {
  const { createFamily, joinFamily, signOut } = useApp();
  const [mode, setMode] = useState('create');
  const [familyName, setFamilyName] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState(MEMBER_COLORS[0]);
  const [emoji, setEmoji] = useState('👩');
  const [busy, setBusy] = useState(false);

  const canSubmit = name.trim() && (mode === 'create' ? familyName.trim() : code.trim());

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      const member = { name: name.trim(), color, emoji };
      if (mode === 'create') await createFamily(familyName.trim(), member);
      else await joinFamily(code.trim(), member);
    } catch (e) {
      Alert.alert('Could not continue', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Eyebrow>Welcome</Eyebrow>
        <Masthead size={34} style={{ marginTop: 6 }}>Your Family</Masthead>
        <Text style={styles.dek}>Begin a new family, or join one with an invite code.</Text>

        <View style={styles.tabs}>
          {[['create', 'Create'], ['join', 'Join']].map(([m, label]) => (
            <Pressable key={m} onPress={() => setMode(m)} style={styles.tab}>
              <Text style={[styles.tabText, mode === m && styles.tabActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {mode === 'create' ? (
          <TextInput value={familyName} onChangeText={setFamilyName} placeholder="Family name — e.g. The Blairs" placeholderTextColor={colors.muted} style={styles.input} />
        ) : (
          <TextInput value={code} onChangeText={setCode} placeholder="Invite code" placeholderTextColor={colors.muted} autoCapitalize="characters" style={styles.input} />
        )}

        <Rule style={{ marginTop: 28, marginBottom: 16 }} />
        <Eyebrow color={colors.muted}>About you</Eyebrow>
        <View style={{ height: 12 }} />
        <MemberEditor name={name} setName={setName} color={color} setColor={setColor} emoji={emoji} setEmoji={setEmoji} namePlaceholder="Your name" />

        <Pressable onPress={submit} disabled={busy || !canSubmit} style={[styles.btn, (busy || !canSubmit) && { opacity: 0.4 }]}>
          <Text style={styles.btnText}>{busy ? 'Please wait' : mode === 'create' ? 'Create family' : 'Join family'}</Text>
        </Pressable>

        <Pressable onPress={() => signOut()} style={styles.signout}>
          <Text style={styles.signoutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 26, paddingBottom: 60 },
  dek: { fontSize: 14, color: colors.charcoal, marginTop: 8, lineHeight: 20, marginBottom: 22 },
  tabs: { flexDirection: 'row', gap: 26, marginBottom: 18 },
  tab: { paddingBottom: 4 },
  tabText: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.muted },
  tabActive: { color: colors.ink, borderBottomWidth: 1, borderBottomColor: colors.gold, paddingBottom: 2 },
  input: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 14, fontSize: 17, color: colors.ink },
  btn: { backgroundColor: colors.ink, paddingVertical: 16, alignItems: 'center', marginTop: 34 },
  btnText: { color: colors.paper, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  signout: { alignItems: 'center', marginTop: 20 },
  signoutText: { color: colors.muted, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },
});
