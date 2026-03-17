
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  Client, 
  MonthlyGoal, 
  Meeting, 
  ClientStatus, 
  UserRole, 
  FinancialEntry, 
  FinanceType, 
  FixedCost, 
  FixedCostStatus,
  Tabulation,
  TabulationType
} from './types';
import { INITIAL_USERS } from './constants';
import { clientesService } from './services/clientesService';
import { agendaService } from './services/agendaService';
import { equipeService } from './services/equipeService';
import { financeiroService } from './services/financeiroService';
import { custosFixosService } from './services/custosFixosService';
import { goalsService } from './services/goalsService';
import { tabulacaoService } from './services/tabulacaoService';

interface AppState {
  users: User[];
  clients: Client[];
  goals: MonthlyGoal[];
  meetings: Meeting[];
  financialEntries: FinancialEntry[];
  fixedCosts: FixedCost[];
  tabulations: Tabulation[];
  currentUser: User | null;
}

export const useStore = () => {
  const isLoaded = useRef(false);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AppState>(() => {
    const savedUser = localStorage.getItem('technova_crm_user');
    let currentUser = null;
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
      } catch (e) {}
    }

    return {
      users: INITIAL_USERS,
      clients: [],
      goals: [{ month: new Date().toISOString().slice(0, 7), targetValue: 7000, reachedValue: 0, isCompleted: false }],
      meetings: [],
      financialEntries: [],
      fixedCosts: [],
      tabulations: [],
      currentUser
    };
  });

  // Fetch state on mount from Supabase
  useEffect(() => {
    const fetchState = async () => {
      console.log("Fetching initial state from Supabase...");
      try {
        const [
          supabaseUsers,
          supabaseClients,
          supabaseMeetings,
          supabaseEntries,
          supabaseCosts,
          supabaseGoals,
          supabaseTabulations
        ] = await Promise.all([
          equipeService.getItems(),
          clientesService.getItems(),
          agendaService.getItems(),
          financeiroService.getItems(),
          custosFixosService.getItems(),
          goalsService.getItems(),
          tabulacaoService.getItems()
        ]);

        console.log("State fetched successfully from Supabase");
        
        // Check for month change to reset fixed costs
        const currentMonth = new Date().toISOString().slice(0, 7);
        let updatedFixedCosts = supabaseCosts || [];
        let needsUpdate = false;

        updatedFixedCosts = updatedFixedCosts.map((cost: FixedCost) => {
          if (cost.lastPaidMonth !== currentMonth && cost.status === FixedCostStatus.PAID) {
            needsUpdate = true;
            return { ...cost, status: FixedCostStatus.PENDING };
          }
          return cost;
        });

        const finalUsers = supabaseUsers.length > 0 ? supabaseUsers : INITIAL_USERS;

        // Handle goals for new month
        const existingGoals = supabaseGoals || [];
        const currentMonthGoal = existingGoals.find(g => g.month === currentMonth);
        
        if (!currentMonthGoal) {
          const date = new Date();
          date.setMonth(date.getMonth() - 1);
          const prevMonth = date.toISOString().slice(0, 7);
          const prevGoal = existingGoals.find(g => g.month === prevMonth);
          
          let nextTarget = 7000;
          if (prevGoal) {
            const prevRevenue = supabaseEntries
              .filter((e: any) => e.type === 'ENTRADA' && e.date.startsWith(prevMonth))
              .reduce((acc: number, curr: any) => acc + curr.amount, 0);
            
            if (prevRevenue >= prevGoal.targetValue) {
              nextTarget = prevGoal.targetValue * 1.25;
            } else {
              nextTarget = prevGoal.targetValue;
            }
          }
          
          const newGoal = { month: currentMonth, targetValue: nextTarget, reachedValue: 0, isCompleted: false };
          await goalsService.addItem(newGoal);
          existingGoals.push(newGoal);
        }

        setState(prev => ({
          ...prev,
          users: finalUsers,
          clients: supabaseClients,
          meetings: supabaseMeetings,
          financialEntries: supabaseEntries,
          fixedCosts: updatedFixedCosts,
          goals: existingGoals.length > 0 ? existingGoals : prev.goals,
          tabulations: supabaseTabulations
        }));

        isLoaded.current = true;
        setLoading(false);

        if (needsUpdate) {
          console.log("Month change detected, resetting fixed costs in Supabase...");
          await Promise.all(updatedFixedCosts.map(cost => 
            custosFixosService.updateItem(cost.id, { status: cost.status })
          ));
        }
      } catch (e) {
        console.error("Failed to fetch state from Supabase", e);
        setLoading(false);
      }
    };
    fetchState();
  }, []);

  // Save currentUser to localStorage for session persistence
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('technova_crm_user', JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem('technova_crm_user');
    }
  }, [state.currentUser]);

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

  const addUser = async (user: Omit<User, 'id'>) => {
    const newUser = await equipeService.addItem(user);
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const deleteUser = async (id: string) => {
    await equipeService.deleteItem(id);
    setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
  };

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClientData = {
      ...client,
      createdAt: new Date().toISOString()
    };
    
    const newClient = await clientesService.addItem(newClientData);
    
    setState(prev => ({
      ...prev,
      clients: [...prev.clients, newClient]
    }));
  };

  const updateClientStatus = async (clientId: string, status: ClientStatus) => {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return;

    await clientesService.updateItem(clientId, { status });

    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === clientId ? { ...c, status } : c)
    }));
  };

  const updateClient = async (clientId: string, updatedData: Partial<Client>) => {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return;

    await clientesService.updateItem(clientId, updatedData);

    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === clientId ? { ...c, ...updatedData } : c)
    }));
  };

  const deleteClient = async (clientId: string) => {
    if (state.currentUser?.role !== UserRole.ADMIN) return;
    
    await clientesService.deleteItem(clientId);
    const relatedEntries = state.financialEntries.filter(e => e.relatedClientId === clientId);
    await Promise.all(relatedEntries.map(e => financeiroService.deleteItem(e.id)));

    setState(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== clientId),
      financialEntries: prev.financialEntries.filter(e => e.relatedClientId !== clientId)
    }));
  };

  const addFinancialEntry = async (entry: Omit<FinancialEntry, 'id'>) => {
    const newEntry = await financeiroService.addItem(entry);
    setState(prev => ({ ...prev, financialEntries: [...prev.financialEntries, newEntry] }));
  };

  const deleteFinancialEntry = async (id: string) => {
    await financeiroService.deleteItem(id);
    setState(prev => ({
      ...prev,
      financialEntries: prev.financialEntries.filter(e => e.id !== id)
    }));
  };

  const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
    const newMeeting = await agendaService.addItem(meeting);
    setState(prev => ({ ...prev, meetings: [...prev.meetings, newMeeting] }));
  };

  const addFixedCost = async (cost: Omit<FixedCost, 'id' | 'status'>) => {
    const newCostData = {
      ...cost,
      status: FixedCostStatus.PENDING
    };
    const newCost = await custosFixosService.addItem(newCostData);
    setState(prev => ({ ...prev, fixedCosts: [...prev.fixedCosts, newCost] }));
  };

  const updateFixedCostStatus = async (id: string, status: FixedCostStatus) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const cost = state.fixedCosts.find(c => c.id === id);
    if (!cost) return;

    const lastPaidMonth = status === FixedCostStatus.PAID ? currentMonth : cost.lastPaidMonth;
    await custosFixosService.updateItem(id, { status, lastPaidMonth });

    let newEntry: FinancialEntry | null = null;
    if (status === FixedCostStatus.PAID && cost.status !== FixedCostStatus.PAID) {
      const entryData: Omit<FinancialEntry, 'id'> = {
        type: FinanceType.EXPENSE,
        description: `Custo Fixo: ${cost.description}`,
        amount: cost.amount,
        category: cost.category,
        paymentMethod: 'A definir',
        date: new Date().toISOString().split('T')[0],
        responsibleId: state.currentUser?.id || 'system',
        notes: `Pagamento automático de custo fixo.`
      };
      newEntry = await financeiroService.addItem(entryData);
    }

    setState(prev => ({
      ...prev,
      fixedCosts: prev.fixedCosts.map(c => 
        c.id === id ? { ...c, status, lastPaidMonth } : c
      ),
      financialEntries: newEntry ? [...prev.financialEntries, newEntry] : prev.financialEntries
    }));
  };

  const deleteFixedCost = async (id: string) => {
    await custosFixosService.deleteItem(id);
    setState(prev => ({
      ...prev,
      fixedCosts: prev.fixedCosts.filter(c => c.id !== id)
    }));
  };

  const updateGoal = async (month: string, targetValue: number) => {
    await goalsService.updateGoal(month, { targetValue });
    setState(prev => {
      const existing = prev.goals.find(g => g.month === month);
      if (existing) {
        return {
          ...prev,
          goals: prev.goals.map(g => g.month === month ? { ...g, targetValue } : g)
        };
      }
      return {
        ...prev,
        goals: [...prev.goals, { month, targetValue, reachedValue: 0, isCompleted: false }]
      };
    });
  };

  const addTabulation = async (tabulation: Omit<Tabulation, 'id' | 'createdAt' | 'responsibleId' | 'responsibleName'>) => {
    const newTabulationData = {
      ...tabulation,
      createdAt: new Date().toISOString(),
      responsibleId: state.currentUser?.id || 'system',
      responsibleName: state.currentUser?.name || 'Sistema'
    };

    const newTabulation = await tabulacaoService.addItem(newTabulationData);

    let newEntry: FinancialEntry | null = null;
    if (newTabulation.type === TabulationType.PAYMENT && newTabulation.paymentAmount) {
      const entryData: Omit<FinancialEntry, 'id'> = {
        type: FinanceType.INCOME,
        description: `Pagamento: ${newTabulation.clientName}`,
        amount: newTabulation.paymentAmount,
        category: 'Venda',
        paymentMethod: newTabulation.paymentMethod || 'A definir',
        date: new Date().toISOString().split('T')[0],
        relatedClientId: newTabulation.clientId,
        responsibleId: newTabulation.responsibleId,
        notes: `Lançamento via tabulação: ${newTabulation.observations}`
      };
      newEntry = await financeiroService.addItem(entryData);
    }

    setState(prev => ({
      ...prev,
      tabulations: [newTabulation, ...prev.tabulations],
      financialEntries: newEntry ? [...prev.financialEntries, newEntry] : prev.financialEntries
    }));
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
    
    const revenue = state.financialEntries
      .filter(e => e.type === FinanceType.INCOME && e.date.startsWith(currentMonth))
      .reduce((acc, curr) => acc + curr.amount, 0);

    const goal = state.goals.find(g => g.month === currentMonth) || { targetValue: 7000 };
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
    deleteFinancialEntry,
    addMeeting,
    addFixedCost,
    updateFixedCostStatus,
    deleteFixedCost,
    updateGoal,
    addTabulation,
    getDashboardData,
    loading
  };
};
