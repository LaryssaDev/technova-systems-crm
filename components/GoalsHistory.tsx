import React from 'react';
import { Target, ArrowUp, ArrowDown, History } from 'lucide-react';

const GoalsHistory: React.FC<{ store: any }> = ({ store }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Target size={200} className="text-blue-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Ciclo de Metas</h2>
            <p className="text-slate-400 max-w-md">Nosso sistema aumenta automaticamente sua meta em 50% caso o objetivo anterior seja batido. Mantenha a consistência!</p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-blue-600 p-6 rounded-2xl text-center min-w-[150px]">
               <p className="text-blue-200 text-xs font-bold uppercase mb-1">Meta Atual</p>
               <p className="text-2xl font-black text-white">R$ {store.goals[store.goals.length - 1].targetValue.toLocaleString()}</p>
             </div>
             <div className="bg-slate-800 p-6 rounded-2xl text-center min-w-[150px] border border-slate-700">
               <p className="text-slate-400 text-xs font-bold uppercase mb-1">Mês Ref.</p>
               <p className="text-2xl font-black text-white">{store.goals[store.goals.length - 1].month}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <History className="text-blue-400" size={20} />
          Histórico de Metas e Crescimento
        </h3>
        
        <div className="space-y-4">
          {[...store.goals].reverse().map((goal: any) => {
            const revenue = store.clients
              .filter((c: any) => c.status === 'FECHADO' && c.createdAt.startsWith(goal.month))
              .reduce((acc: number, curr: any) => acc + curr.contractValue, 0);
            
            const isHit = revenue >= goal.targetValue;
            
            return (
              <div key={goal.month} className="flex items-center justify-between p-5 bg-slate-800/30 border border-slate-800 rounded-xl hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-6">
                   <div className="text-center min-w-[80px]">
                     <p className="text-xs font-bold text-slate-500 uppercase">{goal.month}</p>
                   </div>
                   <div className="h-10 w-px bg-slate-800"></div>
                   <div>
                     <p className="text-xs text-slate-500 font-bold uppercase">Meta Fixada</p>
                     <p className="text-lg font-bold text-white">R$ {goal.targetValue.toLocaleString()}</p>
                   </div>
                </div>

                <div className="flex-1 px-12">
                   <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Progresso Real</span>
                      <span className={`text-[10px] font-bold uppercase ${isHit ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {((revenue / goal.targetValue) * 100).toFixed(1)}%
                      </span>
                   </div>
                   <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${isHit ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                        style={{ width: `${Math.min(100, (revenue / goal.targetValue) * 100)}%` }}
                      ></div>
                   </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-bold uppercase">Resultado</p>
                    <p className={`text-lg font-bold ${isHit ? 'text-emerald-400' : 'text-slate-400'}`}>
                      R$ {revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${isHit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {isHit ? <ArrowUp size={24} /> : <ArrowDown size={24} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GoalsHistory;