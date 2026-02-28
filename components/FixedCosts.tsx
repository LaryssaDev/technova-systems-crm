
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Receipt,
  CalendarDays,
  DollarSign
} from 'lucide-react';
import { FixedCostStatus, UserRole } from '../types';
import { FINANCE_CATEGORIES } from '../constants';

const FixedCosts: React.FC<{ store: any }> = ({ store }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    dueDate: '1',
    category: 'Outros'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addFixedCost(formData);
    setShowModal(false);
    setFormData({ description: '', amount: 0, dueDate: '1', category: 'Outros' });
  };

  const handleStatusToggle = (id: string, currentStatus: FixedCostStatus) => {
    const newStatus = currentStatus === FixedCostStatus.PENDING ? FixedCostStatus.PAID : FixedCostStatus.PENDING;
    store.updateFixedCostStatus(id, newStatus);
  };

  const totalPending = store.fixedCosts
    .filter((c: any) => c.status === FixedCostStatus.PENDING)
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  const totalPaid = store.fixedCosts
    .filter((c: any) => c.status === FixedCostStatus.PAID)
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  if (store.currentUser.role === UserRole.RH || store.currentUser.role === UserRole.SELLER) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Receipt className="text-blue-400" /> Custos Fixos Mensais</h2>
          <p className="text-slate-400 text-sm">Controle de despesas recorrentes e obrigações mensais</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/30 transition-all active:scale-95"
        >
          <Plus size={16} className="inline mr-2" /> Novo Custo Fixo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-rose-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform"><Clock size={32} /></div>
            <span className="text-xs font-black text-rose-500 uppercase tracking-widest">A Pagar</span>
          </div>
          <p className="text-slate-400 text-sm font-bold mb-1 uppercase tracking-tighter">Total Pendente</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
          </h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform"><CheckCircle2 size={32} /></div>
            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Efetivado</span>
          </div>
          <p className="text-slate-400 text-sm font-bold mb-1 uppercase tracking-tighter">Total Pago este Mês</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}
          </h3>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Lista de Custos Recorrentes</h3>
          <div className="flex gap-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendente</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pago</span>
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">Descrição</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">Categoria</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">Vencimento (Dia)</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 text-right">Valor</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 text-center">Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {store.fixedCosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                    Nenhum custo fixo cadastrado.
                  </td>
                </tr>
              ) : (
                store.fixedCosts.map((cost: any) => (
                  <tr key={cost.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{cost.description}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 bg-slate-800 rounded-lg text-slate-400 font-bold uppercase tracking-widest">
                        {cost.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                        <CalendarDays size={14} className="text-blue-400" />
                        Dia {cost.dueDate}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-black text-slate-100">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cost.amount)}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleStatusToggle(cost.id, cost.status)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          cost.status === FixedCostStatus.PAID
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                      >
                        {cost.status}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => store.deleteFixedCost(cost.id)}
                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-800">
              <h3 className="text-xl font-black flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl"><Plus size={20} /></div>
                CADASTRAR CUSTO FIXO
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Descrição do Custo</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Aluguel, Internet, Software..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Valor (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Dia Vencimento</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Categoria</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {FINANCE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/30 transition-all active:scale-95"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedCosts;
