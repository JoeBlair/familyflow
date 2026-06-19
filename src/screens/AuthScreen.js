import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Masthead, Eyebrow } from '../components/ui';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../supabase/config';
import { colors } from '../theme/colors';

export default function AuthScreen() {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const configured = isSupabaseConfigured();

  const submit = async () => {
    if (!email.trim() || !password) return;
    setBusy(true);
    try {
      const fn = mode === 'signin' ? signIn : signUp;
      const { data, error } = await fn(email.trim(), password);
      if (error) Alert.alert('Oops', error.message);
      else if (mode === 'signup' && !data.session) {
        Alert.alert('Check your email', 'Confirm your email to finish signing up, then sign in.');
        setMode('signin');
      }
    } catch (e) {
      Alert.alert('Oops', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
          <Eyebrow style={{ textAlign: 'center' }}>The Family Edit</Eyebrow>
          <Masthead size={44} style={styles.logo}>FamilyFlow</Masthead>
          <View style={styles.hr} />
        </View>

        {!configured && (
          <Text style={styles.warn}>
            Supabase isn't configured. Add your Project URL and anon key in src/supabase/config.js.
          </Text>
        )}

        <View style={styles.tabs}>
          {[['signin', 'Sign in'], ['signup', 'Sign up']].map(([m, label]) => (
            <Pressable key={m} onPress={() => setMode(m)} style={styles.tab}>
              <Text style={[styles.tabText, mode === m && styles.tabActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={styles.input}
        />

        <Pressable onPress={submit} disabled={busy || !email.trim() || !password} style={[styles.btn, (busy || !email.trim() || !password) && { opacity: 0.4 }]}>
          <Text style={styles.btnText}>{busy ? 'Please wait' : mode === 'signin' ? 'Sign in' : 'Create account'}</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { marginTop: 8 },
  hr: { width: 50, height: StyleSheet.hairlineWidth, backgroundColor: colors.gold, marginTop: 18 },
  warn: { color: colors.charcoal, fontSize: 13, fontStyle: 'italic', marginBottom: 20, textAlign: 'center' },
  tabs: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginBottom: 28 },
  tab: { paddingBottom: 6 },
  tabText: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.muted },
  tabActive: { color: colors.ink, borderBottomWidth: 1, borderBottomColor: colors.gold, paddingBottom: 4 },
  input: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    paddingVertical: 14,
    fontSize: 17,
    color: colors.ink,
    marginBottom: 10,
  },
  btn: { backgroundColor: colors.ink, paddingVertical: 16, alignItems: 'center', marginTop: 26 },
  btnText: { color: colors.paper, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
});
