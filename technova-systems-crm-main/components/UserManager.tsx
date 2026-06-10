
import React, { useState } from 'react';
import { UserPlus, Shield, Trash2, User, Key, X, Users, BadgeCheck } from 'lucide-react';
import { UserRole } from '../types';

const UserManager: React.FC<{ store: any }> = ({ store }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    login: '',
    password: '',
    role: UserRole.SELLER
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addUser(formData);
    setShowModal(false);
    setFormData({ name: '', login: '', password: '', role: UserRole.SELLER });
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'border-blue-500/30 text-blue-400 bg-blue-500/5';
      case UserRole.RH: return 'border-purple-500/30 text-purple-400 bg-purple-500/5';
      case UserRole.FINANCEIRO: return 'border-amber-500/30 text-amber-400 bg-amber-500/5';
      default: return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-purple-400" /> Equipe TechNova
          </h2>
          <p className="text-slate-400 text-sm">Gestão de acesso, cargos e permissões de segurança</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-900/30 transition-all active:scale-95"
        >
          <UserPlus size={16} className="inline mr-2" /> Novo Colaborador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {store.users.map((user: any) => (
          <div key={user.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] relative group overflow-hidden transition-all hover:border-slate-700 hover:shadow-2xl">
            <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-5 blur-3xl ${
              user.role === UserRole.ADMIN ? 'bg-blue-500' :
              user.role === UserRole.RH ? 'bg-purple-500' :
              user.role === UserRole.FINANCEIRO ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></div>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-xl tracking-tight">{user.name}</h3>
                <div className={`text-[9px] font-black px-3 py-1 rounded-full border mt-2 inline-flex items-center gap-1.5 uppercase tracking-[0.2em] ${getRoleColor(user.role)}`}>
                  <BadgeCheck size={10} /> {user.role}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8 bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-widest">Login</span>
                <span className="text-slate-200 font-medium">{user.login}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-widest">Senha</span>
                <span className="text-slate-200 font-medium">••••••••</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-800 pt-6">
               <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                  <Users size={12} /> Ativo no CRM
               </div>
               {store.currentUser.id !== user.id && (
                 <button 
                  onClick={() => store.deleteUser(user.id)}
                  className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                  title="Revogar acesso"
                 >
                   <Trash2 size={20} />
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-3">Ativar Novo Membro</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome Completo</label>
                <input required type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-purple-500 outline-none transition-all" placeholder="Nome para exibição" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">ID de Acesso</label>
                  <input required type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-purple-500 outline-none transition-all" placeholder="user.login" value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Hierarquia</label>
                  <select required className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-purple-500 outline-none transition-all" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value={UserRole.SELLER}>Vendedor</option>
                    <option value={UserRole.RH}>RH</option>
                    <option value={UserRole.FINANCEIRO}>Financeiro</option>
                    <option value={UserRole.ADMIN}>Administrador</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Senha de Entrada</label>
                <div className="relative">
                  <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input required type="password" placeholder="Mínimo 8 caracteres" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-14 pr-6 py-4 text-sm focus:border-purple-500 outline-none transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-purple-900/30 active:scale-95">Gerar Chave de Acesso</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
