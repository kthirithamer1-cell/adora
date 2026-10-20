'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Workspace, WorkspaceMember, UserRole, SessionData } from '@/lib/auth';

const SESSION_CACHE_KEY = 'markmosaiq_session_cache';

function getInitialCachedSession(): Partial<SessionData> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCachedSession(data: SessionData | null) {
  if (typeof window === 'undefined') return;
  try {
    if (data) {
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(SESSION_CACHE_KEY);
    }
  } catch {
    // ignore
  }
}

interface WorkspaceContextType {
  user: User | null;
  currentUser: User | null;
  workspace: Workspace | null;
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  role: UserRole;
  isLoading: boolean;
  isOwner: boolean;
  isManager: boolean;
  isDesigner: boolean;
  setSessionDirect: (session: SessionData) => void;
  refreshSession: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string, plan: 'flash' | 'pro' | 'agency') => Promise<Workspace | null>;
  inviteMember: (email: string, name: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  removeMember: (userId: string) => Promise<{ success: boolean; error?: string }>;
  updateCredits: (credits: number) => void;
  loginDemoUser: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({
  children,
  initialSession = null,
}: {
  children: React.ReactNode;
  initialSession?: SessionData | null;
}) {
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [workspace, setWorkspace] = useState<Workspace | null>(initialSession?.workspace || null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialSession?.workspaces || []);
  const [role, setRole] = useState<UserRole>(initialSession?.role || 'owner');
  const [isLoading, setIsLoading] = useState<boolean>(!initialSession?.user);

  const setSessionDirect = (session: SessionData) => {
    setUser(session.user);
    setWorkspace(session.workspace);
    setWorkspaces(session.workspaces || []);
    setRole(session.role || 'owner');
    setIsLoading(false);
    saveCachedSession(session);
  };

  const updateCredits = (credits: number) => {
    setWorkspace((prev) => {
      if (!prev) return null;
      const updated = { ...prev, creditsRemaining: credits };
      if (user) {
        saveCachedSession({
          user,
          workspace: updated,
          workspaces: workspaces.map((w) => (w.id === updated.id ? updated : w)),
          role,
        });
      }
      return updated;
    });
  };

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.data) {
        const session: SessionData = data.data;
        setUser(session.user);
        setWorkspace(session.workspace);
        setWorkspaces(session.workspaces);
        setRole(session.role);
        saveCachedSession(session);
      } else {
        setUser(null);
        setWorkspace(null);
        setWorkspaces([]);
        setRole('owner');
        saveCachedSession(null);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If no initialSession from server, restore from client cache safely after hydration
    if (!initialSession?.user) {
      const cached = getInitialCachedSession();
      if (cached?.user) {
        setUser(cached.user);
        if (cached.workspace) setWorkspace(cached.workspace);
        if (cached.workspaces) setWorkspaces(cached.workspaces);
        if (cached.role) setRole(cached.role);
        setIsLoading(false);
      }
    }
    fetchSession();
  }, [initialSession]);

  const switchWorkspace = async (workspaceId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/workspaces/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSession();
      }
    } catch (err) {
      console.error('Failed to switch workspace:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkspace = async (name: string, plan: 'flash' | 'pro' | 'agency') => {
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, plan }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        await switchWorkspace(data.data.id);
        return data.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to create workspace:', err);
      return null;
    }
  };

  const inviteMember = async (email: string, name: string, memberRole: UserRole) => {
    if (!workspace) return { success: false, error: 'Espace non sélectionné' };
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role: memberRole }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSession();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const removeMember = async (userId: string) => {
    if (!workspace) return { success: false, error: 'Espace non sélectionné' };
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/members?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchSession();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const loginDemoUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSession();
      }
    } catch (err) {
      console.error('Failed to login demo user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    saveCachedSession(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Failed to logout:', err);
    } finally {
      setUser(null);
      setWorkspace(null);
      setWorkspaces([]);
      setRole('owner');
      setIsLoading(false);
      window.location.href = '/login';
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        currentUser: user,
        workspace,
        currentWorkspace: workspace,
        workspaces,
        role,
        isLoading,
        isOwner: role === 'owner',
        isManager: role === 'manager',
        isDesigner: role === 'designer',
        setSessionDirect,
        refreshSession: fetchSession,
        switchWorkspace,
        createWorkspace,
        inviteMember,
        removeMember,
        updateCredits,
        loginDemoUser,
        logout,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
