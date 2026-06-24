import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Modal, Alert, Share, Linking } from 'react-native';
import MemberEditor from '../components/MemberEditor';
import IntroScreen from './IntroScreen';
import { Masthead, Eyebrow, Rule } from '../components/ui';
import { useApp } from '../context/AppContext';
import { MEMBER_COLORS, roleLabels, colors, fonts } from '../theme/colors';

export default function MembersScreen() {
  const { family, members, activeMember, addMember, updateMember, deleteMember, signOut, deleteAccount } = useApp();

  const [editing, setEditing] = useState(null);
  const [howto, setHowto] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(MEMBER_COLORS[0]);
  const [emoji, setEmoji] = useState('🙂');
  const [role, setRole] = useState('member');

  const openNew = () => {
    setName('');
    setColor(MEMBER_COLORS[members.length % MEMBER_COLORS.length]);
    setEmoji('🙂');
    setRole('member');
    setEditing('new');
  };
  const openEdit = (m) => {
    setName(m.name); setColor(m.color); setEmoji(m.emoji); setRole(m.role || 'member'); setEditing(m);
  };

  const save = async () => {
    if (!name.trim()) return;
    try {
      if (editing === 'new') await addMember({ name: name.trim(), color, emoji, role });
      else await updateMember(editing.id, { name: name.trim(), color, emoji, role });
      setEditing(null);
    } catch (e) { Alert.alert('Could not save', e.message); }
  };

  const confirmDelete = (m) => {
    if (members.length <= 1) { Alert.alert('Cannot remove', 'A family needs at least one member.'); return; }
    Alert.alert('Remove member', `Remove ${m.name}? Their chores become unassigned.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteMember(m.id) },
    ]);
  };

  const shareInvite = () => {
    if (!family) return;
    Share.share({ message: `Join our family on FamilyFlow. Invite code: ${family.inviteCode}` });
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account and removes you from the family. ' +
        'If you are the last member, the family and all its chores are deleted too. ' +
        'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (e) {
              Alert.alert('Could not delete account', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <Eyebrow>{family?.name || 'Your Family'}</Eyebrow>
      <Masthead style={{ marginTop: 4 }}>The Household</Masthead>

      {/* Invite */}
      <Rule style={{ marginTop: 20 }} />
      <View style={styles.invite}>
        <View>
          <Eyebrow color={colors.muted}>Invite code</Eyebrow>
          <Text style={styles.code}>{family?.inviteCode || '—'}</Text>
        </View>
        <Pressable style={styles.shareBtn} onPress={shareInvite}>
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
      </View>
      <Rule />

      {/* Who am I — read-only, derived from your login */}
      <Eyebrow style={{ marginTop: 24 }}>Signed in as</Eyebrow>
      {activeMember ? (
        <View style={styles.signedInRow}>
          <View style={[styles.signedInDot, { backgroundColor: activeMember.color }]} />
          <Text style={styles.signedInName}>{activeMember.name}</Text>
        </View>
      ) : (
        <Text style={styles.signedInUnknown}>
          Your login isn't linked to a member yet. Ask a family member to re-invite you, or rejoin with the invite code.
        </Text>
      )}

      {/* Members */}
      <Eyebrow style={{ marginTop: 26 }}>Members</Eyebrow>
      <View style={{ marginTop: 8 }}>
        {members.map((m, i) => (
          <View key={m.id}>
            {i > 0 && <Rule />}
            <View style={styles.memberRow}>
              <View style={[styles.avatar, { backgroundColor: m.color }]}>
                <Text style={styles.avatarEmoji}>{m.emoji}</Text>
              </View>
              <Text style={styles.memberName}>{m.name}</Text>
              {m.role && m.role !== 'member' && (
                <Text style={styles.roleTag}>{roleLabels[m.role]}</Text>
              )}
              <Pressable onPress={() => openEdit(m)} hitSlop={8} style={styles.link}><Text style={styles.linkText}>Edit</Text></Pressable>
              <Pressable onPress={() => confirmDelete(m)} hitSlop={8} style={styles.link}><Text style={[styles.linkText, { color: '#9E5B6B' }]}>Remove</Text></Pressable>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.addBtn} onPress={openNew}>
        <Text style={styles.addText}>+ Add member</Text>
      </Pressable>

      <Pressable onPress={() => signOut()} style={styles.signout}>
        <Text style={styles.signoutText}>Sign out</Text>
      </Pressable>

      <Pressable onPress={confirmDeleteAccount} style={styles.deleteAccount}>
        <Text style={styles.deleteAccountText}>Delete account</Text>
      </Pressable>

      <Pressable onPress={() => setHowto(true)} style={styles.privacy}>
        <Text style={styles.privacyText}>How it works</Text>
      </Pressable>

      <Pressable
        onPress={() => Linking.openURL('https://joeblair.github.io/familyflow/privacy.html')}
        style={styles.privacy}
      >
        <Text style={styles.privacyText}>Privacy policy</Text>
      </Pressable>

      <Modal visible={howto} animationType="slide" onRequestClose={() => setHowto(false)}>
        <IntroScreen onDone={() => setHowto(false)} />
      </Modal>

      {/* Editor */}
      <Modal visible={!!editing} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Eyebrow>{editing === 'new' ? 'New member' : 'Edit member'}</Eyebrow>
            <View style={{ height: 14 }} />
            <MemberEditor name={name} setName={setName} color={color} setColor={setColor} emoji={emoji} setEmoji={setEmoji} role={role} setRole={setRole} showRole namePlaceholder="Name" />
            <View style={styles.sheetBtns}>
              <Pressable style={styles.cancel} onPress={() => setEditing(null)}><Text style={styles.cancelText}>Cancel</Text></Pressable>
              <Pressable style={[styles.saveBtn, !name.trim() && { opacity: 0.4 }]} onPress={save} disabled={!name.trim()}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  invite: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  code: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink, letterSpacing: 6, marginTop: 4 },
  shareBtn: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.ink, paddingVertical: 9, paddingHorizontal: 20 },
  shareText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.ink },
  signedInRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  signedInDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  signedInName: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink },
  signedInUnknown: { fontSize: 13, color: colors.muted, fontStyle: 'italic', marginTop: 10, lineHeight: 19 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarEmoji: { fontSize: 17 },
  memberName: { flex: 1, fontFamily: fonts.serif, fontSize: 19, color: colors.ink },
  roleTag: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: colors.gold, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gold, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  link: { marginLeft: 16 },
  linkText: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: colors.muted },
  addBtn: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.ink, paddingVertical: 14, alignItems: 'center', marginTop: 22 },
  addText: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: colors.ink },
  signout: { alignItems: 'center', marginTop: 28 },
  signoutText: { color: colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },
  deleteAccount: { alignItems: 'center', marginTop: 18 },
  deleteAccountText: { color: '#9E5B6B', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },
  privacy: { alignItems: 'center', marginTop: 16 },
  privacyText: { color: colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0008' },
  sheet: { backgroundColor: colors.bg, padding: 22, paddingBottom: 40 },
  sheetBtns: { flexDirection: 'row', gap: 12, marginTop: 26 },
  cancel: { flex: 1, paddingVertical: 14, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  cancelText: { color: colors.charcoal, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  saveBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.ink },
  saveText: { color: colors.paper, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
});
