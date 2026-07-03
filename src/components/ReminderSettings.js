import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eyebrow } from './ui';
import { colors } from '../theme/colors';
import { ensureNotifPermission, scheduleDailyReminder, cancelDailyReminder } from '../notifications';

const KEY = 'ff_reminder';
const TIMES = [[8, '8 AM'], [12, '12 PM'], [18, '6 PM'], [20, '8 PM']];

// A per-device daily local reminder to check chores. No backend needed.
export default function ReminderSettings() {
  const [on, setOn] = useState(false);
  const [hour, setHour] = useState(18);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v) {
        try { const p = JSON.parse(v); setOn(!!p.on); setHour(p.hour ?? 18); } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const persist = (o, h) => AsyncStorage.setItem(KEY, JSON.stringify({ on: o, hour: h })).catch(() => {});

  const apply = async (nextOn, nextHour) => {
    if (nextOn) {
      const ok = await ensureNotifPermission();
      if (!ok) {
        Alert.alert('Notifications are off', 'Allow notifications for FamilyFlow in your phone Settings to get reminders.');
        setOn(false); persist(false, nextHour);
        return;
      }
      await scheduleDailyReminder(nextHour, 0);
    } else {
      await cancelDailyReminder();
    }
    setOn(nextOn); setHour(nextHour); persist(nextOn, nextHour);
  };

  if (!loaded) return null;

  return (
    <View style={styles.wrap}>
      <Eyebrow>Reminders</Eyebrow>
      <View style={styles.row}>
        <Text style={styles.label}>Daily chore reminder</Text>
        <Switch
          value={on}
          onValueChange={(v) => apply(v, hour)}
          trackColor={{ true: colors.gold, false: colors.line }}
          thumbColor={colors.paper}
        />
      </View>
      {on && (
        <View style={styles.times}>
          {TIMES.map(([h, lbl]) => (
            <Pressable key={h} onPress={() => apply(true, h)} style={[styles.chip, hour === h && styles.chipOn]}>
              <Text style={[styles.chipText, hour === h && styles.chipTextOn]}>{lbl}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 26 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  label: { fontSize: 15, color: colors.ink },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, paddingVertical: 8, paddingHorizontal: 14 },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: colors.charcoal },
  chipTextOn: { color: colors.paper },
});
