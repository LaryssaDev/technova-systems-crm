
import { useState, useEffect, useCallback } from 'react';
import { User, Client, MonthlyGoal, Meeting, ClientStatus, UserRole, FinancialEntry, FinanceType } from './types';
import { INITIAL_USERS } from './constants';

const STORAGE_KEY = 'technova_crm_data_v2_final';

interface AppState {
  users: User[];
  clients: Client[];
  goals: MonthlyGoal[];
  meetings: Meeting[];
  financialEntries: FinancialEntry[];
  currentUser: User | null;
}

export const useStore = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, currentUser: null };
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
    return {
      users: INITIAL_USERS,
      clients: [],
      goals: [{ month: new Date().toISOString().slice(0, 7), targetValue: 5000, reachedValue: 0, isCompleted: false }],
      meetings: [],
      financialEntries: [],
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

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const deleteUser = (id: string) => {
    setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
  };

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    setState(prev => {
      const newEntries = [...prev.financialEntries];
      if (newClient.status === ClientStatus.CLOSED) {
        newEntries.push({
          id: crypto.randomUUID(),
          type: FinanceType.INCOME,
          description: `Venda Efetivada: ${newClient.company}`,
          amount: newClient.contractValue,
          category: 'Venda',
          paymentMethod: 'A definir',
          date: new Date().toISOString().split('T')[0],
          relatedClientId: newClient.id,
          responsibleId: newClient.responsibleId,
          notes: `Lançamento automático de venda.`
        });
      }
      return { ...prev, clients: [...prev.clients, newClient], financialEntries: newEntries };
    });
  };

  const updateClientStatus = (clientId: string, status: ClientStatus) => {
    setState(prev => {
      const client = prev.clients.find(c => c.id === clientId);
      if (!client) return prev;

      let newEntries = [...prev.financialEntries];
      
      if (status === ClientStatus.CLOSED && client.status !== ClientStatus.CLOSED) {
        newEntries.push({
          id: crypto.randomUUID(),
          type: FinanceType.INCOME,
          description: `Venda Efetivada: ${client.company}`,
          amount: client.contractValue,
          category: 'Venda',
          paymentMethod: 'A definir',
          date: new Date().toISOString().split('T')[0],
          relatedClientId: client.id,
          responsibleId: client.responsibleId,
          notes: `Lançamento automático de venda.`
        });
      } else if (status !== ClientStatus.CLOSED && client.status === ClientStatus.CLOSED) {
        newEntries = newEntries.filter(e => e.relatedClientId !== clientId);
      }

      const updatedClients = prev.clients.map(c => 
        c.id === clientId ? { ...c, status } : c
      );
      return { ...prev, clients: updatedClients, financialEntries: newEntries };
    });
  };

  const updateClient = (clientId: string, updatedData: Partial<Client>) => {
    setState(prev => {
      const client = prev.clients.find(c => c.id === clientId);
      if (!client) return prev;

      const newStatus = updatedData.status || client.status;
      const newValue = updatedData.contractValue !== undefined ? updatedData.contractValue : client.contractValue;
      
      let newEntries = [...prev.financialEntries];

      if (newStatus === ClientStatus.CLOSED && client.status !== ClientStatus.CLOSED) {
        newEntries.push({
          id: crypto.randomUUID(),
          type: FinanceType.INCOME,
          description: `Venda Efetivada: ${updatedData.company || client.company}`,
          amount: newValue,
          category: 'Venda',
          paymentMethod: 'A definir',
          date: new Date().toISOString().split('T')[0],
          relatedClientId: client.id,
          responsibleId: updatedData.responsibleId || client.responsibleId,
          notes: `Lançamento automático de venda.`
        });
      } else if (newStatus !== ClientStatus.CLOSED && client.status === ClientStatus.CLOSED) {
        newEntries = newEntries.filter(e => e.relatedClientId !== clientId);
      } else if (newStatus === ClientStatus.CLOSED && client.status === ClientStatus.CLOSED) {
        newEntries = newEntries.map(e => {
          if (e.relatedClientId === clientId) {
            return {
              ...e,
              amount: newValue,
              description: `Venda Efetivada: ${updatedData.company || client.company}`,
              responsibleId: updatedData.responsibleId || client.responsibleId
            };
          }
          return e;
        });
      }

      const updatedClients = prev.clients.map(c => 
        c.id === clientId ? { ...c, ...updatedData } : c
      );

      return { ...prev, clients: updatedClients, financialEntries: newEntries };
    });
  };

  const deleteClient = (clientId: string) => {
    if (state.currentUser?.role !== UserRole.ADMIN) return;
    setState(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== clientId),
      financialEntries: prev.financialEntries.filter(e => e.relatedClientId !== clientId)
    }));
  };

  const addFinancialEntry = (entry: Omit<FinancialEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, financialEntries: [...prev.financialEntries, newEntry] }));
  };

  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    const newMeeting = { ...meeting, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, meetings: [...prev.meetings, newMeeting] }));
  };

  const getDashboardData = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const user = state.currentUser;
    
    const filteredClients = (user?.role === UserRole.SELLER)
      ? state.clients.filter(c => c.responsibleId === user.id)
      : state.clients;

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
    addUser,
    deleteUser,
    addClient,
    updateClientStatus,
    updateClient,
    deleteClient,
    addFinancialEntry,
    addMeeting,
    getDashboardData
  };
};
