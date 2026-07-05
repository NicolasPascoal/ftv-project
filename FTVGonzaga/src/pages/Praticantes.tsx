import { useEffect, useState } from 'react';
import { praticanteService } from '../config/praticanteService';
import { planoService } from '../config/planoService';
import { Users, Phone, Calendar, Award, Trash2, Edit2, EyeOff, Play, Pause, Search } from 'lucide-react';

import type { Plano } from '../config/planoService';

interface PraticanteDashboard {
  id: number;
  nome: string;
  telefone: string;
  plano_nome: string;
  plano_valor: number;
  data_vencimento: string | null;
  pago: boolean;
  atrasado: boolean;
  status: 'Em dia' | 'Atrasado' | 'Sem pagamento' | 'Pago';
  pagamento_id: number | null;
}

function aplicarMascaraTelefone(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const STATUS_CONFIG = {
  'Em dia':        { cor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500' },
  'Pago':          { cor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500' },
  'Atrasado':      { cor: 'bg-red-500/10 text-red-400 border border-red-500/20',         dot: 'bg-red-500' },
  'Sem pagamento': { cor: 'bg-zinc-800 text-zinc-400 border border-zinc-700/50',      dot: 'bg-zinc-500' },
};

const FILTROS = [
  { label: 'Ativos',   valor: 1, icon: Play },
  { label: 'Pausados', valor: 2, icon: Pause },
  { label: 'Inativos', valor: 0, icon: EyeOff },
];

export default function Praticantes() {
  const [praticantes, setPraticantes] = useState<PraticanteDashboard[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState(1);
  const [termoBusca, setTermoBusca] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    plano_id: '',
    data_nascimento: '',
    data_vencimento: '',
    ativo: 1
  });

  useEffect(() => {
    carregarPlanos();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      carregarPraticantes();
    }, 400);

    return () => clearTimeout(timeout);
  }, [filtroAtivo, termoBusca]);

  const carregarPlanos = async () => {
    try {
      const data = await planoService.getAll();
      setPlanos(data);
    } catch (err) {
      console.error("Erro ao carregar planos:", err);
    }
  };

  const carregarPraticantes = async () => {
    try {
      const data = await praticanteService.getDashboard(termoBusca, filtroAtivo);
      setPraticantes(data);
    } catch (err) {
      console.error("Erro ao carregar praticantes:", err);
    }
  };

  const handleEditar = (p: PraticanteDashboard) => {
    setEditandoId(p.id);

    setFormData({
      nome: p.nome,
      telefone: p.telefone ? aplicarMascaraTelefone(p.telefone) : '',
      plano_id: String(planos.find(pl => pl.nome === p.plano_nome)?.id ?? ''),
      data_nascimento: '',
      data_vencimento: '',
      ativo: filtroAtivo
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Excluir este praticante?")) return;

    try {
      await praticanteService.delete(id);
      setPraticantes(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao excluir");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const digitos = formData.telefone.replace(/\D/g, '');
    if (formData.telefone && digitos.length < 10) {
      alert("Telefone inválido. Use o formato (XX) XXXXX-XXXX");
      return;
    }

    try {
      const payload = {
        ...formData,
        telefone: digitos,
        plano_id: Number(formData.plano_id)
      };

      if (editandoId) {
        await praticanteService.update(editandoId, payload);
        await carregarPraticantes();
      } else {
        await praticanteService.create(payload);
        await carregarPraticantes();
      }

      setEditandoId(null);
      setFormData({ nome: '', telefone: '', plano_id: '', data_nascimento: '', data_vencimento: '', ativo: 1 });

    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar praticante.");
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setFormData({ nome: '', telefone: '', plano_id: '', data_nascimento: '', data_vencimento: '', ativo: 1 });
  };

  const formatarData = (data: string | null) => {
    if (!data) return '—';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <p className="text-red-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-1">Módulo Praticantes</p>
        <h2 className="text-3xl font-black text-zinc-100 uppercase italic tracking-tighter">
          Alunos
        </h2>
      </div>

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-[2.5rem] shadow-xl space-y-4">
        <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest ml-1">
          {editandoId ? '📝 Editar Cadastro' : '👤 Novo Cadastro'}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="NOME COMPLETO"
            className="bg-zinc-950/50 border border-zinc-800/80 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 p-4 rounded-2xl text-xs font-semibold focus:outline-none placeholder:text-zinc-600 transition-all text-zinc-100 sm:col-span-2"
            value={formData.nome}
            onChange={e => setFormData({ ...formData, nome: e.target.value })}
            required
          />

          <div className="relative">
            <input
              type="text"
              placeholder="TELEFONE (DDD)"
              className="w-full bg-zinc-950/50 border border-zinc-800/80 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 p-4 rounded-2xl text-xs font-semibold focus:outline-none placeholder:text-zinc-600 transition-all text-zinc-100"
              value={formData.telefone}
              onChange={e => setFormData({ ...formData, telefone: aplicarMascaraTelefone(e.target.value) })}
              maxLength={16}
            />
          </div>

          <input
            type="date"
            placeholder="NASCIMENTO"
            className="bg-zinc-950/50 border border-zinc-800/80 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 p-4 rounded-2xl text-xs font-semibold focus:outline-none transition-all text-zinc-100"
            value={formData.data_nascimento}
            onChange={e => setFormData({ ...formData, data_nascimento: e.target.value })}
          />

          <select
            className="bg-zinc-950/50 border border-zinc-800/80 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 p-4 rounded-2xl text-xs font-semibold focus:outline-none transition-all text-zinc-400"
            value={formData.plano_id}
            onChange={e => setFormData({ ...formData, plano_id: e.target.value })}
            required
          >
            <option value="" disabled className="bg-zinc-900 text-zinc-400">SELECIONE O PLANO</option>
            {planos.map(p => (
              <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-100">
                {p.nome} - R$ {p.valor.toFixed(2)}
              </option>
            ))}
          </select>

          <select
            className="bg-zinc-950/50 border border-zinc-800/80 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 p-4 rounded-2xl text-xs font-semibold focus:outline-none transition-all text-zinc-450"
            value={formData.ativo}
            onChange={e => setFormData({ ...formData, ativo: Number(e.target.value) })}
          >
            <option value={1} className="bg-zinc-900 text-zinc-100">STATUS: ATIVO</option>
            <option value={2} className="bg-zinc-900 text-zinc-100">STATUS: PAUSADO</option>
            <option value={0} className="bg-zinc-900 text-zinc-100">STATUS: INATIVO</option>
          </select>

          {/* Vencimento (só no cadastro) */}
          {!editandoId && (
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">
                Data do 1º Vencimento
              </label>
              <input
                type="date"
                className="w-full bg-zinc-950/50 border border-zinc-800/80 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 p-4 rounded-2xl text-xs font-semibold focus:outline-none transition-all text-zinc-100"
                value={formData.data_vencimento}
                onChange={e => setFormData({ ...formData, data_vencimento: e.target.value })}
                required={!editandoId}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button className="flex-1 bg-red-600 hover:bg-red-500 text-white p-4 rounded-2xl font-black text-xs uppercase transition-all shadow-lg shadow-red-600/10 cursor-pointer">
            {editandoId ? 'Salvar Alterações' : 'Cadastrar Aluno'}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={handleCancelarEdicao}
              className="flex-1 bg-zinc-800 text-zinc-300 p-4 rounded-2xl font-black text-xs uppercase hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="PROCURAR POR NOME..."
            className="w-full bg-zinc-900/40 border border-zinc-800/80 focus:border-red-500/80 p-3.5 pl-11 rounded-2xl text-xs font-semibold focus:outline-none placeholder:text-zinc-600 text-zinc-100 transition-all"
            value={termoBusca}
            onChange={e => setTermoBusca(e.target.value)}
          />
        </div>

        {/* Abas de Status */}
        <div className="flex gap-1 bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-800/80 shrink-0">
          {FILTROS.map(f => {
            const Icon = f.icon;
            const ativo = filtroAtivo === f.valor;
            return (
              <button
                key={f.valor}
                onClick={() => setFiltroAtivo(f.valor)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                  ativo
                    ? 'bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700/50'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Alunos */}
      <div className="space-y-3">
        {praticantes.length === 0 ? (
          <div className="bg-zinc-900/20 border border-zinc-800/80 border-dashed rounded-[2rem] p-12 text-center">
            <Users className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Nenhum praticante encontrado</p>
          </div>
        ) : (
          praticantes.map(p => {
            const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG['Sem pagamento'];
            return (
              <div 
                key={p.id} 
                className="bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-850 p-5 rounded-[2rem] flex justify-between items-center group transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
              >
                <div className="space-y-2">
                  <div>
                    <h3 className="font-black uppercase text-zinc-100 text-base italic leading-tight">
                      {p.nome}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {p.telefone && (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold">
                          <Phone className="w-3 h-3 text-zinc-600" />
                          {aplicarMascaraTelefone(p.telefone)}
                        </span>
                      )}
                      <span className="text-zinc-750 text-[10px]">·</span>
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold">
                        <Award className="w-3 h-3 text-zinc-600" />
                        {p.plano_nome} (R$ {p.plano_valor.toFixed(2).replace('.', ',')})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Badge de status */}
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1.5 uppercase ${cfg.cor}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {p.status}
                    </span>
                    
                    {p.data_vencimento && (
                      <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-600" />
                        Vence: {formatarData(p.data_vencimento)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 ml-4">
                  <button 
                    onClick={() => handleEditar(p)} 
                    className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 border border-zinc-850 hover:border-red-500/20 rounded-xl transition-all duration-200 cursor-pointer"
                    title="Editar Cadastro"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleExcluir(p.id)} 
                    className="p-3 text-zinc-450 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 rounded-xl transition-all duration-200 cursor-pointer"
                    title="Excluir Aluno"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}