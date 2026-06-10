
import React, { useState } from 'react';
import { 
  Plus, Search, Trash2, 
  Mail, Phone, Building2, ChevronRight, User as UserIcon,
  X, Edit2, Save, DollarSign, Calendar, FileText, Tag, Briefcase
} from 'lucide-react';
import { Client, ClientStatus, ServiceType, UserRole } from '../types';
import { STATUS_COLORS } from '../constants';

const ClientList: React.FC<{ store: any }> = ({ store }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ClientStatus>(ClientStatus.PROSPECT);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    segment: '',
    serviceType: ServiceType.SITE,
    contractValue: 0,
    status: ClientStatus.PROSPECT,
    responsibleId: store.currentUser.id,
    notes: ''
  });

  const isSeller = store.currentUser.role === UserRole.SELLER;
  const isAdmin = store.currentUser.role === UserRole.ADMIN;
  const isRH = store.currentUser.role === UserRole.RH;

  const filteredClients = store.clients.filter((c: any) => {
    const matchesUser = (isAdmin || isRH) || c.responsibleId === store.currentUser.id;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesUser && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSeller = store.users.find((u: any) => u.id === formData.responsibleId);
    
    store.addClient({
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
      email: formData.email,
      segment: formData.segment,
      serviceType: formData.serviceType,
      contractValue: formData.contractValue,
      status: formData.status,
      notes: formData.notes,
      responsibleId: isSeller ? store.currentUser.id : formData.responsibleId,
      responsibleName: isSeller ? store.currentUser.name : (selectedSeller?.name || store.currentUser.name)
    });

    setShowModal(false);
    setFormData({
      name: '', company: '', phone: '', email: '', 
      segment: '', serviceType: ServiceType.SITE, 
      contractValue: 0, status: ClientStatus.PROSPECT, 
      responsibleId: store.currentUser.id,
      notes: ''
    });
  };

  const openClientDetail = (client: Client) => {
    setSelectedClient(client);
    setNewStatus(client.status);
    setEditingStatus(false);
  };

  const handleStatusSave = async () => {
    if (!selectedClient) return;
    await store.updateClientStatus(selectedClient.id, newStatus);
    setSelectedClient({ ...selectedClient, status: newStatus });
    setEditingStatus(false);
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const serviceLabels: Record<string, string> = {
    SITE: 'Site Institucional',
    SISTEMA: 'Sistema Web Sob Medida',
    'TRÁFEGO PAGO': 'Tráfego Pago',
    'GESTÃO DE CONTEÚDO': 'Gestão de Conteúdo',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou empresa..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Responsável</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredClients.map((client: any) => (
                <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-white">{client.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building2 size={12} /> {client.company}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail size={12} /> {client.email}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Phone size={12} /> {client.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-800 rounded-md border border-slate-700 uppercase tracking-widest text-slate-400">
                      {client.serviceType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-emerald-400">
                      R$ {client.contractValue.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_COLORS[client.status as keyof typeof STATUS_COLORS]}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <UserIcon size={12} className="text-blue-500/50" /> {client.responsibleName}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       {isAdmin && (
                         <button 
                           onClick={() => store.deleteClient(client.id)}
                           className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                           title="Excluir cliente"
                         >
                           <Trash2 size={18} />
                         </button>
                       )}
                       <button
                         onClick={() => openClientDetail(client)}
                         className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                         title="Ver detalhes do cliente"
                       >
                         <ChevronRight size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-600 italic">
                    Nenhum cliente disponível para exibição.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Cadastrar Cliente ─────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h2 className="text-xl font-bold flex items-center gap-2"><Plus className="text-blue-500" /> Cadastrar Cliente</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><Plus className="rotate-45" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nome Completo</label>
                  <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Empresa</label>
                  <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Corporativo</label>
                  <input required type="email" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WhatsApp / Telefone</label>
                  <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-blue-400 uppercase flex items-center gap-1 tracking-widest">
                    <UserIcon size={12} /> Atribuição de Vendedor
                  </label>
                  <select 
                    disabled={isSeller}
                    className="w-full bg-slate-800 border border-blue-500/20 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none disabled:opacity-50"
                    value={formData.responsibleId}
                    onChange={(e) => setFormData({...formData, responsibleId: e.target.value})}
                  >
                    {store.users.filter((u:any) => u.role === UserRole.SELLER || u.role === UserRole.ADMIN).map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tipo de Serviço</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={formData.serviceType} onChange={(e) => setFormData({...formData, serviceType: e.target.value as ServiceType})}>
                    <option value={ServiceType.SITE}>Site Institucional</option>
                    <option value={ServiceType.SYSTEM}>Sistema Web Sob Medida</option>
                    <option value={ServiceType.TRAFFIC}>Tráfego Pago</option>
                    <option value={ServiceType.CONTENT}>Gestão de Conteúdo</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor Inicial (R$)</label>
                  <input required type="number" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={formData.contractValue} onChange={(e) => setFormData({...formData, contractValue: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status da Jornada</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as ClientStatus})}>
                    <option value={ClientStatus.PROSPECT}>Prospecção</option>
                    <option value={ClientStatus.NEW_LEAD}>Novo Lead - Anuncio</option>
                    <option value={ClientStatus.MEETING}>Em Reunião</option>
                    <option value={ClientStatus.CLOSED}>Fechado (Ganho)</option>
                    <option value={ClientStatus.LOST}>Perdido (Lost)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Segmento de Mercado</label>
                  <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={formData.segment} onChange={(e) => setFormData({...formData, segment: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Briefing Inicial / Notas</label>
                <textarea className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none min-h-[100px]" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-900/40">Efetivar Cadastro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Detalhes do Cliente ───────────────────────────── */}
      {selectedClient && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-900/40 to-slate-900 p-6 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <UserIcon size={26} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{selectedClient.name}</h2>
                    <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 size={13} /> {selectedClient.company}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status badge */}
              <div className="mt-4 flex items-center gap-3">
                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${STATUS_COLORS[selectedClient.status as keyof typeof STATUS_COLORS]}`}>
                  {selectedClient.status}
                </span>
                <span className="text-xs text-slate-500">
                  Cadastrado em {formatDate(selectedClient.createdAt)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Mail size={11} /> Email
                  </p>
                  <p className="text-sm text-slate-200 font-medium break-all">{selectedClient.email || '—'}</p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Phone size={11} /> WhatsApp / Telefone
                  </p>
                  <p className="text-sm text-slate-200 font-medium">{selectedClient.phone || '—'}</p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Briefcase size={11} /> Tipo de Serviço
                  </p>
                  <p className="text-sm text-slate-200 font-medium">
                    {serviceLabels[selectedClient.serviceType] || selectedClient.serviceType}
                  </p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <DollarSign size={11} /> Valor do Contrato
                  </p>
                  <p className="text-sm text-emerald-400 font-black">
                    R$ {selectedClient.contractValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Tag size={11} /> Segmento
                  </p>
                  <p className="text-sm text-slate-200 font-medium">{selectedClient.segment || '—'}</p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <UserIcon size={11} /> Responsável
                  </p>
                  <p className="text-sm text-slate-200 font-medium">{selectedClient.responsibleName || '—'}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <FileText size={11} /> Briefing / Notas
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedClient.notes}</p>
                </div>
              )}

              {/* Alterar Status */}
              {(isAdmin || isSeller) && (
                <div className="bg-slate-800/40 border border-blue-500/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                      <Edit2 size={11} /> Alterar Status da Jornada
                    </p>
                    {!editingStatus && (
                      <button
                        onClick={() => setEditingStatus(true)}
                        className="text-[10px] font-black text-blue-500 hover:text-blue-300 uppercase tracking-widest bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {editingStatus ? (
                    <div className="flex gap-3 items-center">
                      <select
                        className="flex-1 bg-slate-900 border border-blue-500/40 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as ClientStatus)}
                      >
                        <option value={ClientStatus.PROSPECT}>Prospecção</option>
                        <option value={ClientStatus.NEW_LEAD}>Novo Lead - Anuncio</option>
                        <option value={ClientStatus.MEETING}>Em Reunião</option>
                        <option value={ClientStatus.CLOSED}>Fechado (Ganho)</option>
                        <option value={ClientStatus.LOST}>Perdido (Lost)</option>
                      </select>
                      <button
                        onClick={handleStatusSave}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-900/40"
                      >
                        <Save size={14} /> Salvar
                      </button>
                      <button
                        onClick={() => { setEditingStatus(false); setNewStatus(selectedClient.status); }}
                        className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className={`inline-block text-[11px] font-bold px-3 py-1.5 rounded-full border ${STATUS_COLORS[selectedClient.status as keyof typeof STATUS_COLORS]}`}>
                      {selectedClient.status}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
