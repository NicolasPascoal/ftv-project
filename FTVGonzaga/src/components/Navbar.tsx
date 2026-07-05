import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Home, Users, ClipboardList, CreditCard, LogOut } from 'lucide-react';

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/praticantes', label: 'Praticantes', icon: Users },
    { to: '/planos', label: 'Planos', icon: ClipboardList },
    { to: '/pagamentos', label: 'Pagamentos', icon: CreditCard },
  ];

  return (
    <>
      {/* BARRA SUPERIOR ÚNICA */}
      <nav className="bg-zinc-900/80 backdrop-blur-md text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg border-b border-zinc-800/80">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMenuAberto(!menuAberto)} 
            className="hover:text-red-500 hover:bg-zinc-800/60 p-2 rounded-xl transition-all duration-200 cursor-pointer"
            aria-label="Abrir menu"
          >
            {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-xl font-black uppercase tracking-tighter italic">
              FUTEVÔLEI <span className="text-red-500">GONZAGA</span>
            </h1>
          </Link>
        </div>

        {/* Links Inline para telas grandes */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const ativo = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                  ativo 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 ml-4 rounded-xl font-bold text-xs uppercase tracking-wider text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        {/* Botão Sair simplificado para mobile */}
        <button
          onClick={logout}
          className="md:hidden hover:text-red-500 p-2 rounded-xl hover:bg-zinc-800/60 transition-all cursor-pointer"
          aria-label="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      {/* MENU LATERAL (SIDEBAR) */}
      <div className={`fixed top-0 left-0 h-full bg-zinc-900/95 backdrop-blur-xl text-white w-72 transform ${
        menuAberto ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out z-[60] shadow-2xl border-r border-zinc-800/80 flex flex-col justify-between`}>
        
        <div className="p-6">
          {/* Header do Menu */}
          <div className="flex items-center justify-between mb-10 mt-2">
            <h2 className="text-lg font-black uppercase tracking-tighter italic">
              Navegação
            </h2>
            <button 
              onClick={() => setMenuAberto(false)} 
              className="hover:text-red-500 p-2 rounded-xl hover:bg-zinc-800/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links do Menu */}
          <div className="flex flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const ativo = location.pathname === link.to;
              return (
                <Link 
                  key={link.to}
                  to={link.to} 
                  onClick={() => setMenuAberto(false)} 
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all ${
                    ativo 
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/10' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer do Menu */}
        <div className="p-6 border-t border-zinc-800/80">
          <button
            onClick={() => {
              setMenuAberto(false);
              logout();
            }}
            className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wide text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Sair do Sistema
          </button>
        </div>
      </div>
      
      {/* FUNDO ESCURO AO ABRIR MENU */}
      {menuAberto && (
        <div 
          className="fixed inset-0 bg-black/75 z-[55] backdrop-blur-sm transition-all duration-300" 
          onClick={() => setMenuAberto(false)} 
        />
      )}
    </>
  );
}