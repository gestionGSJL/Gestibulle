import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { FamilyMember } from '../types/models';

interface PendingInvite {
  id: string;
  family_id: string;
  family_name: string;
  email: string;
}

interface AuthContextValue {
  session: Session | null;
  member: FamilyMember | null;
  loading: boolean;
  pendingInvite: PendingInvite | null;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  createFamily: (familyName: string, memberName: string) => Promise<{ error: string | null }>;
  acceptInvite: (memberName: string) => Promise<{ error: string | null }>;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMemberState = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) {
      setMember(null);
      setPendingInvite(null);
      return;
    }
    const { data: memberRow } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', currentSession.user.id)
      .maybeSingle();

    if (memberRow) {
      setMember(memberRow as FamilyMember);
      setPendingInvite(null);
      return;
    }
    setMember(null);
    const { data: invite } = await supabase.rpc('pending_invite_for_current_user').maybeSingle();
    if (invite) {
      setPendingInvite({
        id: (invite as any).id,
        family_id: (invite as any).family_id,
        family_name: (invite as any).family_name,
        email: (invite as any).email,
      });
    } else {
      setPendingInvite(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadMemberState(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      loadMemberState(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadMemberState]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const createFamily = useCallback(
    async (familyName: string, memberName: string) => {
      const { error } = await supabase.rpc('create_family_for_new_user', {
        p_family_name: familyName,
        p_member_name: memberName,
      });
      if (error) return { error: error.message };
      await loadMemberState(session);
      return { error: null };
    },
    [session, loadMemberState]
  );

  const acceptInvite = useCallback(
    async (memberName: string) => {
      if (!pendingInvite) return { error: 'Aucune invitation en attente.' };
      const { error } = await supabase.rpc('accept_invite', {
        p_invite_id: pendingInvite.id,
        p_member_name: memberName,
      });
      if (error) return { error: error.message };
      await loadMemberState(session);
      return { error: null };
    },
    [pendingInvite, session, loadMemberState]
  );

  const refreshMember = useCallback(() => loadMemberState(session), [session, loadMemberState]);

  const value = useMemo(
    () => ({ session, member, loading, pendingInvite, signUp, signIn, signOut, createFamily, acceptInvite, refreshMember }),
    [session, member, loading, pendingInvite, signUp, signIn, signOut, createFamily, acceptInvite, refreshMember]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
