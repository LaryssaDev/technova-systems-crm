
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, ExternalLink, Plus } from 'lucide-react';

const Agenda: React.FC<{ store: any }> = ({ store }) => {
  const [meetings, setMeetings] = useState([
    { id: '1', client: 'Alpha Tech', date: '2024-05-20', time: '14:30', type: 'Apresentação Site', responsible: 'Rafaely Silva' },
    { id: '2', client: 'Loja Moderna', date: '2024-05-21', time: '10:00', type: 'Reunião de Escopo', responsible: 'Laryssa G.' }
  ]);

  const handleGoogleCalendar = () => {
    window.open('https://calendar.google.com/calendar/u/0/r/eventedit', '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button 
              onClick={handleGoogleCalendar}
              className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <ExternalLink size={18} />
              Abrir Google Agenda
            </button>
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors">
              <Plus size={18} />
              Nova Reunião
            </button>
          </div>
        </div>

        <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-2xl">
          <p className="text-blue-400 text-xs font-bold uppercase mb-2">Dica de Produtividade</p>
          <p className="text-sm text-blue-100">Prepare o material de apresentação pelo menos 30 minutos antes de cada reunião para garantir uma performance impecável.</p>
        </div>
      </div>

      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-8 rounded-2xl min-h-[500px]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <CalendarIcon className="text-blue-400" />
            Agenda de Reuniões
          </h2>
          <div className="flex gap-2 text-xs font-bold">
            <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-400 border border-slate-700">HOJE</span>
            <span className="px-3 py-1 bg-blue-600 rounded-full text-white">ESTA SEMANA</span>
          </div>
        </div>

        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="flex flex-col md:flex-row gap-4 p-5 bg-slate-800/30 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
              <div className="flex flex-col items-center justify-center bg-slate-900 p-4 rounded-xl border border-slate-800 min-w-[80px]">
                <span className="text-xs font-bold text-slate-500 uppercase">{new Date(meeting.date).toLocaleString('pt-BR', { month: 'short' })}</span>
                <span className="text-2xl font-black text-white">{meeting.date.split('-')[2]}</span>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-bold text-white">{meeting.client}</h4>
                    <p className="text-blue-400 text-sm font-medium">{meeting.type}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Clock size={16} />
                    <span className="text-sm font-bold">{meeting.time}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User size={14} className="text-blue-500" />
                    <span className="font-bold">Resp: {meeting.responsible}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>Confirmada</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Agenda;
