
import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLogin: (login: string, pass: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(login, pass)) {
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
            <span className="text-white text-3xl font-black">TN</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">TechNova Systems</h1>
          <p className="text-slate-500 font-medium">CRM Corporativo de Gestão Inteligente</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
          {error && (
            <div className="absolute -top-4 left-6 right-6 bg-rose-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 animate-bounce">
              <ShieldAlert size={14} />
              Usuário ou senha incorretos
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Identificador</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  required
                  type="text" 
                  placeholder="Seu login corporativo"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Chave de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  required
                  type={showPass ? "text" : "password"} 
                  placeholder="Sua senha secreta"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20 text-lg"
            >
              Acessar Painel
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
             <p className="text-slate-600 text-xs">
               &copy; 2024 TechNova Systems. Sistema restrito a colaboradores autorizados.
             </p>
          </div>
        </div>
        
        <div className="mt-8 text-center opacity-40">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Security Protocol Active-782</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
