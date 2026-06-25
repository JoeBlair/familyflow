import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import * as api from '../data/api';

const AppContext = createContext(null);

// Surface a failed action to the user instead of swallowing it. Fire-and-forget
// mutations (tap to tick / claim / delete) have no screen-level catch, so a
// failed write would otherwise vanish silently and look like a broken app.
function reportError(title, e) {
  const message = e?.message || 'Something went wrong. Please try again.';
  console.warn(title, message);
  Alert.alert(title, message);
}

export function AppProvider({ children }) {
  // auth + profile
  const [booting, setBooting] = useState(true); // initial session check
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // { family_id, active_member_id } | null
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loadingFamily, setLoadingFamily] = useState(false);

  // family data
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [chores, setChores] = useState([]);
  const [battles, setBattles] = useState([]);
  const [ratings, setRatings] = useState([]);

  const unsubRef = useRef(null);

  // ───────────────── auth bootstrap ─────────────────
  useEffect(() => {
    let mounted = true;
    api.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      api.setRealtimeAuth(data.session?.access_token ?? null);
      setSession(data.session ?? null);
      setBooting(false);
    });
    const { data: sub } = api.auth.onChange((s) => {
      api.setRealtimeAuth(s?.access_token ?? null);
      setSession(s);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // ───────────────── load profile when session changes ─────────────────
  useEffect(() => {
    if (!session) {
      setProfile(null);
      setProfileLoaded(false);
      setFamily(null);
      setMembers([]);
      setChores([]);
      setBattles([]);
      setRatings([]);
      return;
    }
    setProfileLoaded(false);
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const refreshProfile = useCallback(async () => {
    try {
      const p = await api.getProfile();
      setProfile(p);
    } catch (e) {
      console.warn('getProfile failed', e.message);
      setProfile(null);
    } finally {
      setProfileLoaded(true);
    }
  }, []);

  // ───────────────── load family data + realtime ─────────────────
  const refreshFamily = useCallback(async (fid) => {
    setFamily(await api.fetchFamily(fid));
  }, []);
  const refreshMembers = useCallback(async (fid) => {
    setMembers(await api.fetchMembers(fid));
  }, []);
  const refreshChores = useCallback(async (fid) => {
    setChores(await api.fetchChores(fid));
  }, []);
  const refreshBattles = useCallback(async (fid) => {
    setBattles(await api.fetchBattles(fid));
  }, []);
  const refreshRatings = useCallback(async (fid) => {
    setRatings(await api.fetchRatings(fid));
  }, []);

  useEffect(() => {
    const fid = profile?.family_id;
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    if (!fid) return;

    let cancelled = false;
    (async () => {
      setLoadingFamily(true);
      try {
        await Promise.all([
          refreshFamily(fid),
          refreshMembers(fid),
          refreshChores(fid),
          refreshBattles(fid),
          refreshRatings(fid),
        ]);
      } catch (e) {
        console.warn('load family failed', e.message);
      } finally {
        if (!cancelled) setLoadingFamily(false);
      }
    })();

    unsubRef.current = api.subscribeFamily(fid, (table) => {
      if (table === 'chores') refreshChores(fid);
      else if (table === 'members') refreshMembers(fid);
      else if (table === 'battles') refreshBattles(fid);
      else if (table === 'families') refreshFamily(fid);
      else if (table === 'ratings') refreshRatings(fid);
    });

    return () => {
      cancelled = true;
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.family_id]);

  // ───────────────── derived ─────────────────
  // Identity is derived from the logged-in auth user: the member whose
  // user_id matches the session. This is the source of truth — NOT
  // profiles.active_member_id, which is now only a DB-side pointer.
  const activeMember = useMemo(
    () => members.find((m) => m.userId === session?.user?.id) || null,
    [members, session?.user?.id]
  );
  const fid = profile?.family_id;

  // Keep profiles.active_member_id pointing at the derived member so the DB
  // stays consistent. We write but never read it for UI decisions.
  useEffect(() => {
    if (!activeMember) return;
    if (profile?.active_member_id === activeMember.id) return;
    api.setActiveMember(activeMember.id).catch((e) =>
      console.warn('sync active_member_id failed', e.message)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMember?.id, profile?.active_member_id]);

  // ───────────────── actions ─────────────────
  const actions = useMemo(
    () => ({
      // auth
      signUp: (email, password) => api.auth.signUp(email, password),
      signIn: (email, password) => api.auth.signIn(email, password),
      signOut: () => api.auth.signOut(),
      deleteAccount: () => api.deleteAccount(),

      // onboarding
      createFamily: async (name, member) => {
        await api.createFamily(name, member);
        await refreshProfile();
      },
      joinFamily: async (code, member) => {
        await api.joinFamily(code, member);
        await refreshProfile();
      },

      // chores
      addChore: async (chore) => {
        try {
          await api.addChore(fid, chore);
          await refreshChores(fid);
        } catch (e) { reportError("Couldn't add chore", e); }
      },
      addChores: async (list) => {
        try {
          await api.addChores(fid, list);
          await refreshChores(fid);
        } catch (e) { reportError("Couldn't add chores", e); }
      },
      deleteChore: async (id) => {
        try {
          await api.deleteChore(id);
          await refreshChores(fid);
        } catch (e) { reportError("Couldn't delete chore", e); }
      },
      claimChore: async (id, memberId) => {
        try {
          await api.setChoreAssignee(id, memberId);
          await refreshChores(fid);
        } catch (e) { reportError("Couldn't claim chore", e); }
      },
      updateChore: async (id, patch) => {
        try {
          await api.updateChore(id, patch);
          await refreshChores(fid);
        } catch (e) { reportError("Couldn't update chore", e); }
      },
      scheduleChore: async (id, calDay, calSlot) => {
        try {
          await api.setChoreSchedule(id, { calDay, calSlot });
          await refreshChores(fid);
        } catch (e) { reportError("Couldn't schedule chore", e); }
      },
      toggleDone: async (chore) => {
        try {
          await api.toggleChoreDone(chore, activeMember?.id ?? null);
          await refreshChores(fid);
        } catch (e) { reportError("Couldn't update chore", e); }
      },

      // members
      addMember: async (m) => {
        await api.addMember(fid, m);
        await refreshMembers(fid);
      },
      updateMember: async (id, patch) => {
        await api.updateMember(id, patch);
        await refreshMembers(fid);
      },
      deleteMember: async (id) => {
        try {
          await api.deleteMember(id);
          await refreshMembers(fid);
        } catch (e) { reportError("Couldn't remove member", e); }
      },
      setMemberWork: async (id, workPct) => {
        try {
          await api.updateMember(id, { workPct });
          await refreshMembers(fid);
        } catch (e) { reportError("Couldn't update workload", e); }
      },

      // battle
      setWeeklyStake: async (stake) => {
        try {
          await api.setWeeklyStake(fid, stake);
          await refreshFamily(fid);
        } catch (e) { reportError("Couldn't set the stake", e); }
      },
      addBattle: async (battle) => {
        try {
          await api.addBattle(fid, battle);
          await refreshBattles(fid);
        } catch (e) { reportError("Couldn't save the result", e); }
      },

      // check-in ratings
      rateTask: async (rating) => {
        try {
          await api.rateTask(fid, rating);
          await refreshRatings(fid);
        } catch (e) { reportError("Couldn't save your rating", e); }
      },
    }),
    [fid, activeMember?.id, refreshProfile, refreshChores, refreshMembers, refreshFamily, refreshBattles, refreshRatings]
  );

  const value = useMemo(
    () => ({
      booting,
      session,
      profile,
      profileLoaded,
      loadingFamily,
      family,
      members,
      chores,
      battles,
      ratings,
      activeMember,
      hasFamily: !!profile?.family_id,
      ...actions,
    }),
    [booting, session, profile, profileLoaded, loadingFamily, family, members, chores, battles, ratings, activeMember, actions]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
