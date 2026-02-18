
import React, { useState } from 'react';
import { 
  Plus, Search, Trash2, 
  Mail, Phone, Building2, ChevronRight, User as UserIcon 
} from 'lucide-react';
import { ClientStatus, ServiceType, UserRole } from '../types';
import { STATUS_COLORS } from '../constants';

const ClientList: React.FC<{ store: any }> = ({ store }) => {
  const [showModal, setShowModal] = useState(false);
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
                         >
                           <Trash2 size={18} />
                         </button>
                       )}
                       <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors">
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
    </div>
  );
};

export default ClientList;
