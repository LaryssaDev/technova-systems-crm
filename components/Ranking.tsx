
import React from 'react';
import { UserRole, ClientStatus } from '../types';
import { Award, Trophy, Medal, Star } from 'lucide-react';

const Ranking: React.FC<{ store: any }> = ({ store }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const sellers = store.users.filter((u: any) => u.role === UserRole.SELLER);
  
  const rankingData = sellers.map((seller: any) => {
    const sellerClients = store.clients.filter((c: any) => 
      c.responsibleId === seller.id && 
      c.status === ClientStatus.CLOSED &&
      c.createdAt.startsWith(currentMonth)
    );
    
    const faturamento = sellerClients.reduce((acc: number, curr: any) => acc + curr.contractValue, 0);
    const fechamentos = sellerClients.length;
    
    return {
      name: seller.name,
      faturamento,
      fechamentos,
      avatar: seller.name.charAt(0)
    };
  }).sort((a: any, b: any) => b.faturamento - a.faturamento);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Trophy className="text-amber-400" size={36} />
          Ranking de Performance
        </h2>
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">Mês Vigente: {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pb-8">
        {/* 2nd Place */}
        {rankingData[1] && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-4 order-2 md:order-1 h-64 justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-slate-700 border-4 border-slate-500 flex items-center justify-center text-2xl font-bold">
                {rankingData[1].avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-500 text-white p-1 rounded-full">
                <Medal size={16} />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-white">{rankingData[1].name}</h3>
              <p className="text-slate-500 text-xs">🥈 2º Lugar</p>
            </div>
            <p className="text-emerald-400 font-black">R$ {rankingData[1].faturamento.toLocaleString()}</p>
          </div>
        )}

        {/* 1st Place */}
        {rankingData[0] && (
          <div className="bg-slate-900 border-2 border-amber-500/50 p-8 rounded-2xl flex flex-col items-center gap-4 order-1 md:order-2 h-80 justify-center shadow-2xl shadow-amber-500/10">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-amber-500 flex items-center justify-center text-4xl font-bold shadow-lg">
                {rankingData[0].avatar}
              </div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                <Trophy size={32} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full">
                <Star size={20} fill="currentColor" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">{rankingData[0].name}</h3>
              <p className="text-amber-400 text-sm font-bold uppercase tracking-widest">🥇 Líder de Vendas</p>
            </div>
            <div className="bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
              <p className="text-amber-400 text-2xl font-black">R$ {rankingData[0].faturamento.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {rankingData[2] && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-4 order-3 h-56 justify-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-slate-700 border-4 border-orange-700 flex items-center justify-center text-xl font-bold">
                {rankingData[2].avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-orange-700 text-white p-1 rounded-full">
                <Medal size={14} />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-white">{rankingData[2].name}</h3>
              <p className="text-slate-500 text-xs">🥉 3º Lugar</p>
            </div>
            <p className="text-emerald-400 font-black">R$ {rankingData[2].faturamento.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Quadro Geral</h3>
        <div className="space-y-3">
          {rankingData.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-slate-500 font-bold w-4 text-center">{i + 1}º</span>
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
                  {item.avatar}
                </div>
                <div>
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{item.fechamentos} contratos fechados</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-bold">R$ {item.faturamento.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ranking;
