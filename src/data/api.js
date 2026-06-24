import { supabase } from '../supabase/client';
import { currentPeriodKey } from '../utils/periods';

// ───────────────────────── row <-> app mappers ─────────────────────────
const rowToChore = (r) => ({
  id: r.id,
  title: r.title,
  frequency: r.frequency,
  domain: r.domain,
  assignee: r.assignee_id,
  isCustom: r.is_custom,
  lastCompletedPeriod: r.last_completed_period,
  completedBy: r.completed_by,
  calDay: r.cal_day ?? null,
  calSlot: r.cal_slot ?? null,
});

const rowToRating = (r) => ({
  id: r.id,
  weekKey: r.week_key,
  choreId: r.chore_id,
  choreTitle: r.chore_title,
  raterId: r.rater_id,
  rateeId: r.ratee_id,
  stars: r.stars,
  status: r.status ?? null,
});

const rowToMember = (r) => ({
  id: r.id,
  name: r.name,
  color: r.color,
  emoji: r.emoji,
  workPct: r.work_pct,
  userId: r.user_id,
  role: r.role ?? 'member',
});

const rowToBattle = (r) => ({
  id: r.id,
  date: r.created_at,
  weekKey: r.week_key,
  stakeChoreTitle: r.stake_chore_title,
  winner: r.winner_id,
  loser: r.loser_id,
  scores: r.scores,
});

// ─────────────────────────────── auth ──────────────────────────────────
export const auth = {
  signUp: (email, password) => supabase.auth.signUp({ email, password }),
  signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getSession: () => supabase.auth.getSession(),
  onChange: (cb) => supabase.auth.onAuthStateChange((_e, session) => cb(session)),
};

// Authenticate the realtime socket with the user's JWT so RLS-gated
// postgres_changes events are delivered. Must be set on sign-in / refresh.
export function setRealtimeAuth(token) {
  supabase.realtime.setAuth(token ?? null);
}

// ───────────────────────── profile / family setup ──────────────────────
export async function getProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data; // null if no profile/family yet
}

export async function createFamily(familyName, member) {
  const { data, error } = await supabase.rpc('create_family', {
    p_family_name: familyName,
    p_member_name: member.name,
    p_color: member.color,
    p_emoji: member.emoji,
  });
  if (error) throw error;
  return data; // family_id
}

export async function joinFamily(code, member) {
  const { data, error } = await supabase.rpc('join_family', {
    p_code: code,
    p_member_name: member.name,
    p_color: member.color,
    p_emoji: member.emoji,
  });
  if (error) throw error;
  return data; // family_id
}

export async function setActiveMember(memberId) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('profiles')
    .update({ active_member_id: memberId })
    .eq('id', user.id);
  if (error) throw error;
}

// Permanently delete the caller's account and their data (see the
// delete_account RPC). Signs out afterwards to clear the local session.
export async function deleteAccount() {
  const { error } = await supabase.rpc('delete_account');
  if (error) throw error;
  await supabase.auth.signOut();
}

// ──────────────────────────── fetchers ─────────────────────────────────
export async function fetchFamily(familyId) {
  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    inviteCode: data.invite_code,
    weeklyStake: data.weekly_stake,
  };
}

export async function fetchMembers(familyId) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(rowToMember);
}

export async function fetchChores(familyId) {
  const { data, error } = await supabase
    .from('chores')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(rowToChore);
}

export async function fetchBattles(familyId) {
  const { data, error } = await supabase
    .from('battles')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(rowToBattle);
}

// ──────────────────────────── mutations ────────────────────────────────
export async function addChore(familyId, { title, frequency, domain, calDay, calSlot }) {
  const row = { family_id: familyId, title, frequency, domain, is_custom: true };
  if (calSlot) row.cal_slot = calSlot;
  if (calDay) row.cal_day = calDay;
  const { error } = await supabase.from('chores').insert(row);
  if (error) throw error;
}

export async function setChoreSchedule(id, { calDay, calSlot }) {
  const { error } = await supabase
    .from('chores')
    .update({ cal_day: calDay ?? null, cal_slot: calSlot ?? null })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteChore(id) {
  const { error } = await supabase.from('chores').delete().eq('id', id);
  if (error) throw error;
}

export async function setChoreAssignee(id, memberId) {
  const { error } = await supabase
    .from('chores')
    .update({ assignee_id: memberId })
    .eq('id', id);
  if (error) throw error;
}

// chore: full app-shaped object; memberId: who is toggling
export async function toggleChoreDone(chore, memberId) {
  const period = currentPeriodKey(chore.frequency);
  const isDone = chore.lastCompletedPeriod === period;
  const patch = isDone
    ? { last_completed_period: null, completed_by: null }
    : { last_completed_period: period, completed_by: memberId };
  const { error } = await supabase.from('chores').update(patch).eq('id', chore.id);
  if (error) throw error;
}

export async function addMember(familyId, { name, color, emoji, role }) {
  const { error } = await supabase
    .from('members')
    .insert({ family_id: familyId, name, color, emoji, role: role ?? 'member' });
  if (error) throw error;
}

export async function updateMember(id, patch) {
  const row = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.color !== undefined) row.color = patch.color;
  if (patch.emoji !== undefined) row.emoji = patch.emoji;
  if (patch.workPct !== undefined) row.work_pct = patch.workPct;
  if (patch.role !== undefined) row.role = patch.role;
  const { error } = await supabase.from('members').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteMember(id) {
  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) throw error;
}

export async function setWeeklyStake(familyId, stake) {
  const { error } = await supabase
    .from('families')
    .update({ weekly_stake: stake })
    .eq('id', familyId);
  if (error) throw error;
}

export async function addBattle(familyId, battle) {
  const { error } = await supabase.from('battles').insert({
    family_id: familyId,
    week_key: battle.weekKey,
    stake_chore_title: battle.stakeChoreTitle,
    winner_id: battle.winner,
    loser_id: battle.loser,
    scores: battle.scores,
  });
  if (error) throw error;
}

// ──────────────────────────── ratings ──────────────────────────────────
// Returns [] if the ratings table doesn't exist yet (migration not applied).
export async function fetchRatings(familyId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('fetchRatings failed (run the calendar/check-in migration?)', error.message);
    return [];
  }
  return data.map(rowToRating);
}

export async function rateTask(familyId, { weekKey, choreId, choreTitle, raterId, rateeId, stars, status }) {
  const { error } = await supabase.from('ratings').upsert(
    {
      family_id: familyId,
      week_key: weekKey,
      chore_id: choreId,
      chore_title: choreTitle,
      rater_id: raterId,
      ratee_id: rateeId,
      stars: stars ?? null,
      status: status ?? null,
    },
    { onConflict: 'family_id,week_key,chore_id,rater_id' }
  );
  if (error) throw error;
}

// ──────────────────────────── realtime ─────────────────────────────────
// Calls onChange(table) whenever chores/members/battles/families for this
// family change. Returns an unsubscribe function.
export function subscribeFamily(familyId, onChange) {
  const channel = supabase.channel(`family:${familyId}`);
  ['chores', 'members', 'battles', 'families', 'ratings'].forEach((table) => {
    const filter =
      table === 'families' ? `id=eq.${familyId}` : `family_id=eq.${familyId}`;
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter },
      () => onChange(table)
    );
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}
