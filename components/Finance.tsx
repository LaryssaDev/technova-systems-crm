
import React, { useState } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, PieChart, Plus, X, Calendar, Briefcase, TrendingUp, Trash2, Search } from 'lucide-react';
import { FinanceType, UserRole } from '../types';
import { FINANCE_CATEGORIES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Finance: React.FC<{ store: any }> = ({ store }) => {
  const [showModal, setShowModal] = useState(false);
  const [showAllMovements, setShowAllMovements] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    type: FinanceType.INCOME,
    description: '',
    amount: 0,
    category: 'Venda',
    paymentMethod: 'Pix',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const incomes = store.financialEntries.filter((e: any) => e.type === FinanceType.INCOME);
  const expenses = store.financialEntries.filter((e: any) => e.type === FinanceType.EXPENSE);

  const totalIncomes = incomes.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const balance = totalIncomes - totalExpenses;

  const chartData = [
    { name: 'Entradas', value: totalIncomes },
    { name: 'Saídas', value: totalExpenses },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addFinancialEntry({
      ...formData,
      responsibleId: store.currentUser.id
    });
    setShowModal(false);
    setFormData({ type: FinanceType.INCOME, description: '', amount: 0, category: 'Venda', paymentMethod: 'Pix', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const filteredMovements = store.financialEntries
    .filter((e: any) => e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (store.currentUser.role === UserRole.RH) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="text-emerald-400" /> Fluxo de Caixa</h2>
          <p className="text-slate-400 text-sm">Gestão financeira e controle de lucratividade estratégica</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
        >
          <Plus size={16} className="inline mr-2" /> Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform"><ArrowUpCircle size={32} /></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Faturamento Total</span>
          </div>
          <p className="text-4xl font-black text-white">R$ {totalIncomes.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-rose-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform"><ArrowDownCircle size={32} /></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Despesas / Saídas</span>
          </div>
          <p className="text-4xl font-black text-white">R$ {totalExpenses.toLocaleString()}</p>
        </div>
        <div className={`bg-slate-900 border-2 p-8 rounded-3xl ${balance >= 0 ? 'border-emerald-500/20' : 'border-rose-500/20'} relative overflow-hidden group transition-all`}>
           <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 ${balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${balance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} group-hover:scale-110 transition-transform`}><PieChart size={32} /></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Saldo Disponível</span>
          </div>
          <p className={`text-4xl font-black ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>R$ {balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] h-[450px]">
           <h3 className="text-lg font-bold mb-8 flex items-center gap-2"><TrendingUp size={20} className="text-blue-500" /> Histórico Mensal</h3>
           <ResponsiveContainer width="100%" height="80%">
             <BarChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} />
               <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
               <Tooltip cursor={{fill: '#1e293b', radius: 12}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '15px'}} />
               <Bar dataKey="value" radius={[20, 20, 0, 0]} barSize={60}>
                 {chartData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold">Movimentações Recentes</h3>
            <button 
              onClick={() => setShowAllMovements(true)}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
            >
              Ver Tudo
            </button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {[...store.financialEntries].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map((entry: any) => (
              <div key={entry.id} className="flex items-center justify-between p-5 bg-slate-800/20 border border-slate-800/50 rounded-2xl hover:bg-slate-800/40 transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${entry.type === FinanceType.INCOME ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {entry.type === FinanceType.INCOME ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 text-sm tracking-tight">{entry.description}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{entry.category} • {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-black text-lg ${entry.type === FinanceType.INCOME ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.type === FinanceType.INCOME ? '+' : '-'} R$ {entry.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase">{entry.paymentMethod}</p>
                  </div>
                  <button 
                    onClick={() => store.deleteFinancialEntry(entry.id)}
                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir Lançamento"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {store.financialEntries.length === 0 && (
              <div className="flex-1 flex items-center justify-center italic text-slate-600">Sem registros financeiros.</div>
            )}
          </div>
        </div>
      </div>

      {showAllMovements && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl h-[80vh] rounded-[40px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-3"><TrendingUp className="text-blue-500" /> Todas as Movimentações</h2>
                <p className="text-slate-500 text-xs mt-1">Gerencie o histórico completo de transações</p>
              </div>
              <button onClick={() => setShowAllMovements(false)} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-full"><X /></button>
            </div>
            
            <div className="p-6 bg-slate-900/50 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por descrição ou categoria..." 
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-blue-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {filteredMovements.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-6 bg-slate-800/20 border border-slate-800/50 rounded-3xl hover:bg-slate-800/40 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${entry.type === FinanceType.INCOME ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {entry.type === FinanceType.INCOME ? <ArrowUpCircle size={28} /> : <ArrowDownCircle size={28} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-base tracking-tight">{entry.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{entry.category}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{entry.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <p className={`font-black text-xl ${entry.type === FinanceType.INCOME ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.type === FinanceType.INCOME ? '+' : '-'} R$ {entry.amount.toLocaleString()}
                    </p>
                    <button 
                      onClick={() => {
                        if(confirm('Tem certeza que deseja excluir este lançamento?')) {
                          store.deleteFinancialEntry(entry.id);
                        }
                      }}
                      className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                      title="Excluir Lançamento"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredMovements.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                  <Search size={48} className="opacity-20" />
                  <p className="italic">Nenhum lançamento encontrado para sua busca.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h2 className="text-xl font-bold flex items-center gap-3"><Briefcase className="text-emerald-500" /> Registro Financeiro</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="flex p-1.5 bg-slate-800 rounded-2xl border border-slate-700">
                <button type="button" onClick={() => setFormData({...formData, type: FinanceType.INCOME})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === FinanceType.INCOME ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-slate-400'}`}>Entrada</button>
                <button type="button" onClick={() => setFormData({...formData, type: FinanceType.EXPENSE})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === FinanceType.EXPENSE ? 'bg-rose-600 text-white shadow-xl shadow-rose-900/40' : 'text-slate-400'}`}>Saída</button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Título do Lançamento</label>
                  <input required type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all" placeholder="Descrição rápida" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Valor Total (R$)</label>
                  <input required type="number" step="0.01" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Data da Operação</label>
                  <input required type="date" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Categoria</label>
                  <select className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {FINANCE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Método</label>
                  <input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all" placeholder="Pix, TED..." value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />
                </div>
              </div>
              <button type="submit" className={`w-full py-5 rounded-2xl font-black text-white text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${formData.type === FinanceType.INCOME ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30'}`}>Efetivar Operação</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;

