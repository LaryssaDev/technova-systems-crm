
import { useState, useEffect, useCallback } from 'react';
import { User, Client, MonthlyGoal, Meeting, ClientStatus, UserRole } from './types';
import { INITIAL_USERS } from './constants';

const STORAGE_KEY = 'technova_crm_data';

interface AppState {
  users: User[];
  clients: Client[];
  goals: MonthlyGoal[];
  meetings: Meeting[];
  currentUser: User | null;
}

export const useStore = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, currentUser: null }; // Reset session on load
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
    return {
      users: INITIAL_USERS,
      clients: [],
      goals: [{ month: new Date().toISOString().slice(0, 7), targetValue: 5000, reachedValue: 0, isCompleted: false }],
      meetings: [],
      currentUser: null
    };
  });

  const saveToStorage = useCallback((newState: AppState) => {
    const { currentUser, ...persistentState } = newState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentState));
  }, []);

  useEffect(() => {
    saveToStorage(state);
  }, [state, saveToStorage]);

  // Auth logic
  const login = (loginStr: string, pass: string) => {
    const user = state.users.find(u => u.login === loginStr && u.password === pass);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  // Client Logic
  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setState(prev => {
      const updatedClients = [...prev.clients, newClient];
      return { ...prev, clients: updatedClients };
    });
  };

  const updateClientStatus = (clientId: string, status: ClientStatus) => {
    setState(prev => {
      const updatedClients = prev.clients.map(c => 
        c.id === clientId ? { ...c, status } : c
      );
      return { ...prev, clients: updatedClients };
    });
  };

  const deleteClient = (clientId: string) => {
    if (state.currentUser?.role !== UserRole.ADMIN) return;
    setState(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== clientId)
    }));
  };

  // Goal Auto-logic
  const checkAndUpdateGoals = useCallback(() => {
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const existingGoal = state.goals.find(g => g.month === currentMonthStr);

    if (!existingGoal) {
      // Logic for new month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7);
      const prevGoal = state.goals.find(g => g.month === lastMonthStr);

      let nextTarget = 5000;
      if (prevGoal) {
        const revenue = state.clients
          .filter(c => c.status === ClientStatus.CLOSED && c.createdAt.startsWith(lastMonthStr))
          .reduce((acc, curr) => acc + curr.contractValue, 0);
        
        if (revenue >= prevGoal.targetValue) {
          nextTarget = prevGoal.targetValue * 1.5;
        } else {
          nextTarget = prevGoal.targetValue;
        }
      }

      const newGoal: MonthlyGoal = {
        month: currentMonthStr,
        targetValue: nextTarget,
        reachedValue: 0,
        isCompleted: false
      };

      setState(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal]
      }));
    }
  }, [state.goals, state.clients]);

  useEffect(() => {
    checkAndUpdateGoals();
  }, [checkAndUpdateGoals]);

  // Derived Values
  const getDashboardData = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const filteredClients = state.currentUser?.role === UserRole.ADMIN 
      ? state.clients 
      : state.clients.filter(c => c.responsibleId === state.currentUser?.id);

    const prospects = filteredClients.filter(c => c.status === ClientStatus.PROSPECT).length;
    const meetingsCount = filteredClients.filter(c => c.status === ClientStatus.MEETING).length;
    const closed = filteredClients.filter(c => c.status === ClientStatus.CLOSED).length;
    
    const revenue = filteredClients
      .filter(c => c.status === ClientStatus.CLOSED && c.createdAt.startsWith(currentMonth))
      .reduce((acc, curr) => acc + curr.contractValue, 0);

    const goal = state.goals.find(g => g.month === currentMonth) || { targetValue: 5000 };
    
    const conversion = prospects > 0 ? (closed / prospects) * 100 : 0;
    
    return {
      prospects,
      meetingsCount,
      closed,
      revenue,
      goal: goal.targetValue,
      conversion,
      remaining: Math.max(0, goal.targetValue - revenue),
      percent: Math.min(100, (revenue / goal.targetValue) * 100)
    };
  };

  return {
    ...state,
    login,
    logout,
    addClient,
    updateClientStatus,
    deleteClient,
    getDashboardData
  };
};
