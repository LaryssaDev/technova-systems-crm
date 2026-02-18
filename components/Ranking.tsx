
import React from 'react';
import { UserRole, ClientStatus } from '../types';
import { Trophy, Medal, Star, ShieldAlert } from 'lucide-react';

const Ranking: React.FC<{ store: any }> = ({ store }) => {
  const user = store.currentUser;
  
  if (user?.role === UserRole.SELLER) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
        <ShieldAlert size={64} className="text-amber-500/20 mb-4" />
        <h2 className="text-xl font-bold text-slate-200">Acesso Restrito</h2>
        <p className="text-slate-500 mt-2 max-w-xs">A visualização do ranking geral da equipe é permitida apenas para cargos administrativos e RH.</p>
      </div>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const sellers = store.users.filter((u: any) => u.role === UserRole.SELLER || u.role === UserRole.ADMIN);
  
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
  }).filter((s:any) => s.faturamento > 0).sort((a: any, b: any) => b.faturamento - a.faturamento);

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Trophy className="text-amber-400" size={36} />
          Hall da Fama TechNova
        </h2>
        <p className="text-slate-400 uppercase tracking-[0.2em] text-[10px] font-black">Performance Comercial - {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</p>
      </div>

      {rankingData.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-20 rounded-3xl text-center text-slate-600">
           Nenhum faturamento registrado no mês atual para compor o ranking.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pb-8 pt-10">
            {rankingData[1] && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-4 order-2 md:order-1 h-64 justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-slate-700 border-4 border-slate-500 flex items-center justify-center text-2xl font-bold text-white">
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

            {rankingData[0] && (
              <div className="bg-slate-900 border-2 border-amber-500/50 p-8 rounded-3xl flex flex-col items-center gap-4 order-1 md:order-2 h-80 justify-center shadow-2xl shadow-amber-500/20">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-amber-500 flex items-center justify-center text-4xl font-bold shadow-lg text-white">
                    {rankingData[0].avatar}
                  </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                    <Trophy size={40} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full">
                    <Star size={20} fill="currentColor" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-white">{rankingData[0].name}</h3>
                  <p className="text-amber-400 text-xs font-black uppercase tracking-[0.3em] mt-1">Líder de Vendas</p>
                </div>
                <div className="bg-amber-500/10 px-6 py-3 rounded-2xl border border-amber-500/20 mt-2">
                  <p className="text-amber-400 text-3xl font-black">R$ {rankingData[0].faturamento.toLocaleString()}</p>
                </div>
              </div>
            )}

            {rankingData[2] && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-4 order-3 h-56 justify-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-slate-700 border-4 border-orange-700 flex items-center justify-center text-xl font-bold text-white">
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

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-white font-black mb-6 uppercase text-[10px] tracking-[0.3em]">Quadro de Medalhas</h3>
            <div className="space-y-4">
              {rankingData.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-800/20 border border-slate-800 rounded-2xl hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-6">
                    <span className="text-slate-600 font-black text-lg w-6 text-center">{i + 1}º</span>
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white">
                      {item.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.fechamentos} CONTRATOS EFETIVADOS</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-xl font-black">R$ {item.faturamento.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Ranking;
