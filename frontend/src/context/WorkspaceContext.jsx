import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children, user }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    localStorage.getItem('activeWorkspaceId') || null
  );
  const [usage, setUsage] = useState({ total: 1, max: 1, canCreateMore: false, plan: 'FREE' });
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      setWorkspaces([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/workspaces');
      const data = res.data || {};
      const wsList = data.workspaces || [];
      const usageInfo = data.usage || { total: wsList.length, max: 1, canCreateMore: false, plan: user.plan };

      setWorkspaces(wsList);
      setUsage(usageInfo);

      // Restore or default active workspace ID
      let currentActiveId = localStorage.getItem('activeWorkspaceId');
      const exists = wsList.some((w) => w.id === currentActiveId);

      if (!currentActiveId || !exists) {
        const defaultWs = wsList.find((w) => w.isDefault) || wsList[0];
        if (defaultWs) {
          currentActiveId = defaultWs.id;
          localStorage.setItem('activeWorkspaceId', defaultWs.id);
        }
      }
      setActiveWorkspaceId(currentActiveId);
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const switchWorkspace = (id) => {
    const ws = workspaces.find((w) => w.id === id);
    if (ws) {
      setActiveWorkspaceId(id);
      localStorage.setItem('activeWorkspaceId', id);
    }
  };

  const createWorkspace = async ({ name, description, color, icon }) => {
    try {
      const res = await api.post('/workspaces', { name, description, color, icon });
      const newWs = res.data;
      await fetchWorkspaces();
      if (newWs?.id) {
        switchWorkspace(newWs.id);
      }
      setIsCreateModalOpen(false);
      return { success: true, workspace: newWs };
    } catch (err) {
      if (err.message && err.message.includes('nâng cấp')) {
        setIsUpgradeModalOpen(true);
      }
      throw err;
    }
  };

  const updateWorkspace = async (id, data) => {
    const res = await api.put(`/workspaces/${id}`, data);
    await fetchWorkspaces();
    return res.data;
  };

  const deleteWorkspace = async (id) => {
    const res = await api.delete(`/workspaces/${id}`);
    if (activeWorkspaceId === id) {
      const remaining = workspaces.filter((w) => w.id !== id);
      if (remaining.length > 0) {
        switchWorkspace(remaining[0].id);
      }
    }
    await fetchWorkspaces();
    return res.data;
  };

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspaceId,
        activeWorkspace,
        usage,
        loading,
        fetchWorkspaces,
        switchWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
