
import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Phone, 
  MessageSquare, 
  DollarSign, 
  Calendar,
  User as UserIcon,
  ChevronRight,
  Clock
} from 'lucide-react';
import { 
  Client, 
  Tabulation, 
  TabulationType, 
  PaymentMethod 
} from '../types';

interface TabulacaoProps {
  store: any;
}

const Tabulacao: React.FC<TabulacaoProps> = ({ store }) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [type, setType] = useState<TabulationType>(TabulationType.CONTACT);
  const [phoneUsed, setPhoneUsed] = useState('');
  const [observations, setObservations] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);

  const selectedClient = store.clients.find((c: Client) => c.id === selectedClientId);
  const clientTabulations = store.tabulations.filter((t: Tabulation) => t.clientId === selectedClientId);

  const filteredClients = store.clients.filter((c: Client) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedClient) return;

    const tabulationData: any = {
      clientId: selectedClientId,
      clientName: selectedClient.name,
      type,
      phoneUsed,
      observations,
    };

    if (type === TabulationType.PAYMENT) {
      tabulationData.paymentAmount = Number(paymentAmount);
      tabulationData.paymentMethod = paymentMethod;
    }

    await store.addTabulation(tabulationData);
    
    // Reset form
    setIsModalOpen(false);
    setType(TabulationType.CONTACT);
    setPhoneUsed('');
    setObservations('');
    setPaymentAmount('');
    setPaymentMethod(PaymentMethod.PIX);
  };

  const getTypeIcon = (type: TabulationType) => {
    switch (type) {
      case TabulationType.CONTACT: return <Phone size={14} className="text-blue-400" />;
      case TabulationType.PAYMENT: return <DollarSign size={14} className="text-emerald-400" />;
      case TabulationType.OBSERVATION: return <MessageSquare size={14} className="text-amber-400" />;
    }
  };

  const getTypeLabel = (type: TabulationType) => {
    switch (type) {
      case TabulationType.CONTACT: return 'Contato';
      case TabulationType.PAYMENT: return 'Pagamento';
      case TabulationType.OBSERVATION: return 'Observação';
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Client List Sidebar */}
      <div className="col-span-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
        <div className="p-4 border-bottom border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredClients.map((client: Client) => (
            <button
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                selectedClientId === client.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  selectedClientId === client.id ? 'bg-white/20' : 'bg-slate-800'
                }`}>
                  {client.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold truncate max-w-[150px]">{client.name}</p>
                  <p className={`text-[10px] uppercase tracking-widest font-black ${
                    selectedClientId === client.id ? 'text-blue-100' : 'text-slate-500'
                  }`}>{client.company}</p>
                </div>
              </div>
              <ChevronRight size={16} className={selectedClientId === client.id ? 'text-white' : 'text-slate-700 group-hover:text-slate-500'} />
            </button>
          ))}
        </div>
      </div>

      {/* Tabulations View */}
      <div className="col-span-8 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
        {selectedClient ? (
          <>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/20">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedClient.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-widest">
                    <span>{selectedClient.company}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span>{selectedClient.phone}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-900/20"
              >
                <Plus size={18} />
                Nova Tabulação
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {clientTabulations.length > 0 ? (
                clientTabulations.map((tab: Tabulation) => (
                  <div key={tab.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          tab.type === TabulationType.CONTACT ? 'bg-blue-500/10' :
                          tab.type === TabulationType.PAYMENT ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                        }`}>
                          {getTypeIcon(tab.type)}
                        </div>
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            tab.type === TabulationType.CONTACT ? 'bg-blue-500/20 text-blue-400' :
                            tab.type === TabulationType.PAYMENT ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {getTypeLabel(tab.type)}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
                            <Clock size={10} />
                            {new Date(tab.createdAt).toLocaleString()}
                            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                            <UserIcon size={10} />
                            {tab.responsibleName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                        <Phone size={12} />
                        <span className="text-xs font-bold">{tab.phoneUsed}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                      {tab.observations}
                    </p>

                    {tab.type === TabulationType.PAYMENT && (
                      <div className="mt-4 flex items-center gap-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest">Valor</span>
                          <span className="text-emerald-400 font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tab.paymentAmount || 0)}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-emerald-500/10"></div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest">Forma</span>
                          <span className="text-emerald-400 font-bold">{tab.paymentMethod}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
                  <ClipboardList size={48} strokeWidth={1} />
                  <p className="text-sm font-bold uppercase tracking-widest">Nenhuma tabulação encontrada</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
            <UserIcon size={64} strokeWidth={1} />
            <p className="text-sm font-bold uppercase tracking-widest">Selecione um cliente para ver as tabulações</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Nova Tabulação</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tipo do Registro</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: TabulationType.CONTACT, label: 'Contato' },
                    { id: TabulationType.PAYMENT, label: 'Pagamento' },
                    { id: TabulationType.OBSERVATION, label: 'Observação' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setType(opt.id)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                        type === opt.id 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Telefone Utilizado</label>
                <input
                  type="text"
                  required
                  value={phoneUsed}
                  onChange={(e) => setPhoneUsed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="(00) 00000-0000"
                />
              </div>

              {type === TabulationType.PAYMENT && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Dados do Pagamento</p>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Valor do Pagamento</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">R$</span>
                      <input
                        type="number"
                        required
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-emerald-400 font-bold"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Forma de Pagamento</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors appearance-none text-slate-300"
                    >
                      {Object.values(PaymentMethod).map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Observações</label>
                <textarea
                  required
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Detalhes da interação..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tabulacao;
