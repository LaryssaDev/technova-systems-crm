import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';
import { 
  TrendingUp, Users, CalendarCheck, CheckCircle, 
  Target, DollarSign, ArrowUpRight, Award, Kanban
} from 'lucide-react';
import { getMotivationalMessage } from '../services/geminiService';

const Dashboard: React.FC<{ store: any }> = ({ store }) => {
  const data = store.getDashboardData();
  const [motivation, setMotivation] = useState("Foco nas metas de hoje!");

  useEffect(() => {
    const fetchMotivation = async () => {
      const msg = await getMotivationalMessage(data.percent, data.percent >= 100);
      setMotivation(msg);
    };
    fetchMotivation();
  }, [data.percent]);

  const cards = [
    { label: 'Prospectados', value: data.prospects, icon: Users, color: 'text-blue-400' },
    { label: 'Reuniões', value: data.meetingsCount, icon: CalendarCheck, color: 'text-purple-400' },
    { label: 'Fechados', value: data.closed, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Taxa Conversão', value: `${data.conversion.toFixed(1)}%`, icon: TrendingUp, color: 'text-amber-400' },
  ];

  const revenueData = [
    { name: 'Semana 1', value: data.revenue * 0.2 },
    { name: 'Semana 2', value: data.revenue * 0.4 },
    { name: 'Semana 3', value: data.revenue * 0.7 },
    { name: 'Semana 4', value: data.revenue },
  ];

  const pipelineData = [
    { name: 'Prospect', value: data.prospects },
    { name: 'Reunião', value: data.meetingsCount },
    { name: 'Fechado', value: data.closed },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/20 to-slate-900 border border-blue-500/20 p-4 rounded-xl flex items-center gap-4 animate-pulse">
        <Award className="text-blue-400" size={32} />
        <p className="text-blue-100 font-medium italic">{motivation}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-slate-800 ${card.color}`}>
                <card.icon size={24} />
              </div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-tighter">Mensal</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{card.value}</h3>
            <p className="text-slate-400 text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Target className="text-blue-400" size={20} />
            Meta Mensal
          </h3>
          <div className="flex-1 flex flex-col justify-center items-center gap-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-800" />
                <circle 
                  cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" 
                  strokeDasharray={440} 
                  strokeDashoffset={440 - (440 * data.percent) / 100} 
                  className="text-blue-500 transition-all duration-1000 ease-out" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{data.percent.toFixed(0)}%</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Atingido</span>
              </div>
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Faturado</span>
                <span className="text-emerald-400 font-bold">R$ {data.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Meta do Mês</span>
                <span className="text-blue-400 font-bold">R$ {data.goal.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Restante</span>
                  <span className="text-lg font-bold text-white">R$ {data.remaining.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={20} />
              Evolução de Faturamento
            </h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-800 rounded-md text-xs text-slate-300">Este Mês</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Kanban className="text-purple-400" size={20} />
            Funil de Vendas (Pipeline)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#f8fafc', fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#1e293b'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {pipelineData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#a855f7', '#10b981'][index % 3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <DollarSign size={120} className="text-blue-500" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-2">Resumo Operacional</h3>
            <p className="text-slate-400 text-sm mb-6">Informações consolidadas de desempenho.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Ticket Médio</p>
                  <p className="text-xl font-bold text-white">R$ {data.closed > 0 ? (data.revenue / data.closed).toFixed(0) : 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Leads Ativos</p>
                  <p className="text-xl font-bold text-white">{data.prospects + data.meetingsCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;