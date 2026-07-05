import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../config/api';
import { Volleyball, Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { username, password });
      login(response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.erro || 'Usuário ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fundo para dar profundidade e visual premium */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-800/10 blur-[120px] pointer-events-none" />

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 p-8 sm:p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-red-600/30">
            <Volleyball className="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-black text-zinc-100 uppercase italic tracking-tighter">
            FTV <span className="text-red-500">GONZAGA</span>
          </h1>
          <p className="text-zinc-400 font-medium mt-1 text-xs uppercase tracking-widest">
            Área Administrativa
          </p>
        </div>

        {error && (
          <div className="bg-red-950/30 text-red-400 p-4 rounded-2xl mb-6 text-xs font-semibold text-center border border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest ml-1">
              Usuário
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 p-4 pl-12 rounded-2xl text-zinc-100 font-semibold focus:outline-none placeholder:text-zinc-600 transition-all text-sm"
                placeholder="Digite seu usuário..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest ml-1">
              Senha
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 p-4 pl-12 rounded-2xl text-zinc-100 font-semibold focus:outline-none placeholder:text-zinc-600 transition-all text-sm"
                placeholder="Digite sua senha..."
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-black uppercase tracking-wider py-4 rounded-2xl hover:bg-red-500 active:scale-[0.98] transition-all disabled:opacity-50 mt-6 shadow-lg shadow-red-600/20 cursor-pointer text-xs"
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
