
import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { UserRole } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import Pipeline from './components/Pipeline';
import Ranking from './components/Ranking';
import Login from './components/Login';
import GoalsHistory from './components/GoalsHistory';
import Agenda from './components/Agenda';
import UserManager from './components/UserManager';
import Finance from './components/Finance';
import FixedCosts from './components/FixedCosts';

const App: React.FC = () => {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Proteção de rotas interna: Se o usuário mudar para uma aba que não tem permissão
  useEffect(() => {
    if (!store.currentUser) return;
    
    const permissions: Record<string, UserRole[]> = {
      dashboard: [UserRole.ADMIN, UserRole.SELLER, UserRole.RH, UserRole.FINANCEIRO],
      clients: [UserRole.ADMIN, UserRole.SELLER, UserRole.RH],
      pipeline: [UserRole.ADMIN, UserRole.SELLER],
      goals: [UserRole.ADMIN, UserRole.SELLER],
      ranking: [UserRole.ADMIN, UserRole.RH],
      agenda: [UserRole.ADMIN, UserRole.SELLER, UserRole.RH],
      users: [UserRole.ADMIN, UserRole.RH],
      fixed_costs: [UserRole.ADMIN, UserRole.FINANCEIRO],
      finance: [UserRole.ADMIN, UserRole.FINANCEIRO],
    };

    const allowedRoles = permissions[activeTab];
    if (allowedRoles && !allowedRoles.includes(store.currentUser.role)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, store.currentUser]);

  if (store.loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-600/10 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">TechNova CRM</h2>
          <p className="text-slate-500 text-xs font-bold animate-pulse uppercase tracking-tighter">Sincronizando dados com o servidor...</p>
        </div>
      </div>
    );
  }

  if (!store.currentUser) {
    return <Login onLogin={store.login} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard store={store} />;
      case 'clients':
        return <ClientList store={store} />;
      case 'pipeline':
        return <Pipeline store={store} />;
      case 'goals':
        return <GoalsHistory store={store} />;
      case 'ranking':
        return <Ranking store={store} />;
      case 'agenda':
        return <Agenda store={store} />;
      case 'users':
        return <UserManager store={store} />;
      case 'fixed_costs':
        return <FixedCosts store={store} />;
      case 'finance':
        return <Finance store={store} />;
      default:
        return <Dashboard store={store} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={store.logout} 
        user={store.currentUser} 
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-white capitalize">
              {activeTab === 'dashboard' ? 'Painel de Controle' : 
               activeTab === 'fixed_costs' ? 'Custos Fixos Mensais' : 
               activeTab}
            </h1>
            <p className="text-slate-400 text-sm italic">TechNova CRM v2.0 - Gestão Estratégica</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-3">
                <div className="flex items-center gap-1.5 mr-2 pr-3 border-r border-slate-800">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sincronizado</span>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  store.currentUser.role === UserRole.ADMIN ? 'bg-blue-500' : 
                  store.currentUser.role === UserRole.SELLER ? 'bg-green-500' :
                  store.currentUser.role === UserRole.RH ? 'bg-purple-500' : 'bg-amber-500'
                }`}></div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  {store.currentUser.role}
                </span>
             </div>
          </div>
        </header>

        <div className="mt-4">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
