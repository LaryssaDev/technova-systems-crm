
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  Target, 
  Trophy, 
  Calendar, 
  ShieldCheck, 
  DollarSign,
  Receipt,
  LogOut 
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, user }) => {
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.SELLER, UserRole.RH, UserRole.FINANCEIRO] },
    { id: 'clients', label: 'Clientes', icon: Users, roles: [UserRole.ADMIN, UserRole.SELLER, UserRole.RH] },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban, roles: [UserRole.ADMIN, UserRole.SELLER] },
    { id: 'goals', label: 'Metas', icon: Target, roles: [UserRole.ADMIN, UserRole.SELLER] },
    { id: 'ranking', label: 'Ranking', icon: Trophy, roles: [UserRole.ADMIN, UserRole.RH] },
    { id: 'agenda', label: 'Agenda', icon: Calendar, roles: [UserRole.ADMIN, UserRole.SELLER, UserRole.RH] },
    { id: 'users', label: 'Equipe', icon: ShieldCheck, roles: [UserRole.ADMIN, UserRole.RH] },
    { id: 'fixed_costs', label: 'Custos Fixos', icon: Receipt, roles: [UserRole.ADMIN, UserRole.FINANCEIRO] },
    { id: 'finance', label: 'Financeiro', icon: DollarSign, roles: [UserRole.ADMIN, UserRole.FINANCEIRO] },
  ];

  const filteredMenu = allMenuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 fixed h-full flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8 group cursor-default">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <span className="text-white font-black italic">T</span>
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
            TechNova
          </h2>
        </div>

        <nav className="space-y-1">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'group-hover:text-blue-400'} />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800/40 rounded-2xl border border-slate-800/50">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold uppercase ring-2 ring-blue-600/20">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-slate-100 truncate tracking-tight">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate font-bold tracking-widest">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-rose-900/30 hover:text-rose-400 transition-all active:scale-95"
        >
          <LogOut size={16} />
          <span className="text-xs font-black uppercase tracking-widest">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
