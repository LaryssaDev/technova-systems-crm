
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, ExternalLink, Plus, Building, X } from 'lucide-react';
import { Meeting, UserRole } from '../types';

const Agenda: React.FC<{ store: any }> = ({ store }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    clientId: '',
    date: '',
    time: '',
    notes: '',
    responsibleId: store.currentUser.id
  });

  const handleGoogleCalendar = (m: Meeting) => {
    const title = encodeURIComponent(m.title);
    const details = encodeURIComponent(`${m.notes}\n\nEmpresa: ${m.company}\nResponsável: ${m.responsibleName}`);
    
    // Formato do Google: YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ
    const dateStr = m.date.replace(/-/g, '');
    const timeStr = m.time.replace(/:/g, '') + '00';
    const dates = `${dateStr}T${timeStr}/${dateStr}T${(parseInt(timeStr) + 10000).toString().padStart(6, '0')}`;
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${encodeURIComponent(m.company)}&dates=${dates}`;
    window.open(url, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = store.clients.find((c: any) => c.id === formData.clientId);
    const selectedResp = store.users.find((u: any) => u.id === formData.responsibleId);

    store.addMeeting({
      title: formData.title,
      company: formData.company || selectedClient?.company || 'Não informada',
      clientId: formData.clientId || 'external',
      clientName: selectedClient?.name || 'Cliente Externo',
      responsibleId: formData.responsibleId,
      responsibleName: selectedResp?.name || store.currentUser.name,
      date: formData.date,
      time: formData.time,
      notes: formData.notes
    });

    setShowModal(false);
    setFormData({ title: '', company: '', clientId: '', date: '', time: '', notes: '', responsibleId: store.currentUser.id });
  };

  const isSeller = store.currentUser.role === UserRole.SELLER;
  const filteredMeetings = isSeller 
    ? store.meetings.filter((m: any) => m.responsibleId === store.currentUser.id)
    : store.meetings;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="text-blue-400" /> Agenda de Compromissos
          </h2>
          <p className="text-slate-400 text-sm">Gerencie reuniões e apresentações comerciais</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          <Plus size={18} /> Nova Reunião
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeetings.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
            <CalendarIcon size={48} className="mx-auto mb-4 opacity-10 text-white" />
            <p className="text-slate-500 italic">Nenhuma reunião agendada para este período.</p>
          </div>
        ) : (
          [...filteredMeetings].reverse().map((meeting: Meeting) => (
            <div key={meeting.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl border-l-4 border-l-blue-600 hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-800 px-3 py-1 rounded-lg text-blue-400 text-xs font-black uppercase tracking-widest">
                  {new Date(meeting.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </div>
                <button 
                  onClick={() => handleGoogleCalendar(meeting)}
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                  title="Google Calendar"
                >
                  <ExternalLink size={16} />
                </button>
              </div>

              <h4 className="text-lg font-bold text-white mb-1">{meeting.title}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-4 uppercase font-bold tracking-tighter">
                <Building size={12} /> {meeting.company}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Clock size={16} className="text-blue-500" />
                  <span>{meeting.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <User size={16} className="text-blue-500" />
                  <span>{meeting.responsibleName}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 italic line-clamp-2">
                {meeting.notes || "Sem observações adicionais."}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2"><Plus className="text-blue-500" /> Agendar Nova Reunião</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Título do Compromisso</label>
                  <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" placeholder="Ex: Demonstração de Produto" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Empresa do Cliente</label>
                  <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" placeholder="Nome Fantasia" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vincular Cliente CRM</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                    <option value="">Nenhum / Externo</option>
                    {store.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data</label>
                  <input required type="date" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hora</label>
                  <input required type="time" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notas de Briefing</label>
                <textarea className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none min-h-[80px]" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:text-white">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all">Salvar Reunião</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
