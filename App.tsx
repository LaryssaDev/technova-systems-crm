
import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { UserRole, ClientStatus } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import Pipeline from './components/Pipeline';
import Ranking from './components/Ranking';
import Login from './components/Login';
import GoalsHistory from './components/GoalsHistory';
import Agenda from './components/Agenda';
import { Layout } from 'lucide-react';

const App: React.FC = () => {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');

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
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white capitalize">
              {activeTab === 'dashboard' ? 'Painel de Controle' : activeTab}
            </h1>
            <p className="text-slate-400 text-sm">Bem-vindo(a), {store.currentUser.name}</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${store.currentUser.role === UserRole.ADMIN ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {store.currentUser.role}
                </span>
             </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;
