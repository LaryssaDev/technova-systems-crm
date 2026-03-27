import React, { useState } from 'react';
import { useStore } from '../store';
import { TimeClockType, UserRole, TimeClockEntry } from '../types';
import { Clock, FileText, Calendar, User as UserIcon, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TimeClock: React.FC<{ store: any }> = ({ store }) => {
  const { currentUser, users, addTimeClockEntry, getTimeClockReport, timeClockEntries } = store;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Report filters
  const [reportUserId, setReportUserId] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportEntries, setReportEntries] = useState<TimeClockEntry[]>([]);
  const [showReport, setShowReport] = useState(false);

  const handleRegister = async (type: TimeClockType) => {
    setLoading(true);
    setMessage(null);
    try {
      await addTimeClockEntry(type);
      setMessage({ type: 'success', text: `Ponto de ${type} registrado com sucesso!` });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erro ao registrar ponto. Tente novamente.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handlePullReport = async () => {
    setLoading(true);
    try {
      const entries = await getTimeClockReport(reportUserId || null, startDate, endDate);
      setReportEntries(entries);
      setShowReport(true);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erro ao buscar relatório.' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-8">
      {/* Registro de Ponto */}
      <section className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Registrar Ponto</h2>
            <p className="text-slate-400 text-sm">Olá, {currentUser?.name}. Registre sua jornada de trabalho.</p>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: TimeClockType.LOGIN, color: 'blue', label: 'Entrada' },
            { type: TimeClockType.LUNCH_OUT, color: 'amber', label: 'Saída Almoço' },
            { type: TimeClockType.LUNCH_IN, color: 'indigo', label: 'Volta Almoço' },
            { type: TimeClockType.LOGOUT, color: 'rose', label: 'Saída' }
          ].map((btn) => (
            <button
              key={btn.type}
              onClick={() => handleRegister(btn.type)}
              disabled={loading}
              className={`group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
              } border-slate-800 bg-slate-900/60 hover:border-${btn.color}-500/50`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-${btn.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative flex flex-col items-center gap-3">
                <div className={`p-3 bg-${btn.color}-500/10 rounded-xl group-hover:bg-${btn.color}-500/20 transition-colors`}>
                  <Clock className={`w-6 h-6 text-${btn.color}-400`} />
                </div>
                <span className="font-bold text-slate-200">{btn.label}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Relatório de Ponto */}
      <section className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 backdrop-blur-md">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Relatório de Ponto</h2>
              <p className="text-slate-400 text-sm">Consulte o histórico de registros por período.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Funcionário</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={reportUserId}
                onChange={(e) => setReportUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
              >
                <option value="">Todos os Funcionários</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Data Início</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Data Fim</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handlePullReport}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : (
                <>
                  <Download className="w-4 h-4" />
                  Puxar Relatório
                </>
              )}
            </button>
          </div>
        </div>

        {showReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-bottom border-slate-800">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Data</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Funcionário</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {reportEntries.length > 0 ? (
                    reportEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 text-sm text-slate-300">{formatDate(entry.timestamp)}</td>
                        <td className="p-4 text-sm font-medium text-white">{entry.userName}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            entry.type === TimeClockType.LOGIN ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            entry.type === TimeClockType.LUNCH_OUT ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            entry.type === TimeClockType.LUNCH_IN ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-mono text-slate-400">{formatTime(entry.timestamp)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-500 italic">
                        Nenhum registro encontrado para este período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </section>

      {/* Últimos Registros (Geral) */}
      {!showReport && (
        <section className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-6">Últimos Registros</h3>
          <div className="space-y-3">
            {timeClockEntries.slice(0, 5).map((entry: TimeClockEntry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    entry.type === TimeClockType.LOGIN ? 'bg-blue-500/10 text-blue-400' :
                    entry.type === TimeClockType.LUNCH_OUT ? 'bg-amber-500/10 text-amber-400' :
                    entry.type === TimeClockType.LUNCH_IN ? 'bg-indigo-500/10 text-indigo-400' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{entry.userName}</p>
                    <p className="text-xs text-slate-500">{entry.type} • {formatDate(entry.timestamp)}</p>
                  </div>
                </div>
                <span className="text-sm font-mono text-slate-400">{formatTime(entry.timestamp)}</span>
              </div>
            ))}
            {timeClockEntries.length === 0 && (
              <p className="text-center text-slate-500 py-8 italic">Nenhum registro recente.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default TimeClock;
