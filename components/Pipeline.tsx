import React from 'react';
import { ClientStatus, UserRole } from '../types';
import { Building2, User } from 'lucide-react';

const Pipeline: React.FC<{ store: any }> = ({ store }) => {
  const columns = [
    { id: ClientStatus.PROSPECT, label: 'Prospect', icon: '🎯' },
    { id: ClientStatus.MEETING, label: 'Reunião', icon: '📅' },
    { id: ClientStatus.CLOSED, label: 'Fechado', icon: '💰' },
    { id: ClientStatus.LOST, label: 'Perdido', icon: '❌' },
  ];

  const getClientsByStatus = (status: ClientStatus) => {
    return store.clients.filter((c: any) => {
      const isAdmin = store.currentUser.role === UserRole.ADMIN;
      return (isAdmin || c.responsibleId === store.currentUser.id) && c.status === status;
    });
  };

  const handleStatusChange = (clientId: string, newStatus: ClientStatus) => {
    store.updateClientStatus(clientId, newStatus);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)] overflow-hidden">
      {columns.map((col) => (
        <div key={col.id} className="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 h-full">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">{col.icon}</span>
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">{col.label}</h3>
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold">
                {getClientsByStatus(col.id).length}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {getClientsByStatus(col.id).map((client: any) => (
              <div 
                key={client.id} 
                className="group relative bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-blue-500/50 transition-all cursor-default"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-sm line-clamp-1">{client.name}</h4>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <select 
                      className="bg-slate-800 text-[10px] rounded p-1 outline-none border border-slate-700 text-slate-300"
                      value={client.status}
                      onChange={(e) => handleStatusChange(client.id, e.target.value as ClientStatus)}
                    >
                      {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 size={12} />
                    <span className="truncate">{client.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User size={12} />
                    <span>{client.responsibleName}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-600 uppercase">{client.serviceType}</span>
                  <span className="text-sm font-bold text-emerald-400">R$ {client.contractValue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Pipeline;