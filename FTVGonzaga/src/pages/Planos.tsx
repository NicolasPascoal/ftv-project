import { useEffect, useState } from 'react';
import { planoService } from '../config/planoService';
import { Award, DollarSign, Edit2, Trash2, ClipboardList } from 'lucide-react';
import type { Plano } from '../config/planoService';

export default function Planos() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nome: '', valor: '' });

  const carregarPlanos = async () => {
    try {
      const data = await planoService.getAll();
      setPlanos(data);
    } catch (err) {
      console.error("Erro ao carregar planos:", err);
    }
  };

  useEffect(() => {
    carregarPlanos();
  }, []);

  const handleEditar = (plano: Plano) => {
    setEditandoId(plano.id);
    setFormData({
      nome: plano.nome,
      valor: String(plano.valor)
    });
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Excluir este plano?")) return;

    try {
      await planoService.delete(id);
      setPlanos(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao excluir plano");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        nome: formData.nome,
        valor: Number(formData.valor)
      };

      if (editandoId) {
        const atualizado = await planoService.update(editandoId, payload);
        setPlanos(prev => prev.map(p => (p.id === editandoId ? atualizado : p)));
      } else {
        const novo = await planoService.create(payload);
        setPlanos(prev => [...prev, novo]);
      }

      setFormData({ nome: '', valor: '' });
      setEditandoId(null);

    } catch (err) {
      console.error("Erro ao salvar plano:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <p className="text-red-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-1">Configurações</p>
        <h2 className="text-3xl font-black text-zinc-100 uppercase italic tracking-tighter">
          Planos
        </h2>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-[2.5rem] shadow-xl space-y-4">
        <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest ml-1">
          {editandoId ? '📝 Editar Plano' : '➕ Novo Plano'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">
              Nome do Plano
            </label>
            <input
              type="text"
              placeholder="EX: MENSAL 2X, ANUAL"
              className="w-full bg-zinc-950/50 border border-zinc-800/80 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 p-4 rounded-2xl text-xs font-semibold focus:outline-none placeholder:text-zinc-600 text-zinc-100 transition-all"
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">
              Valor Mensal (R$)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              className="w-full bg-zinc-950/50 border border-zinc-800/80 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 p-4 rounded-2xl text-xs font-semibold focus:outline-none placeholder:text-zinc-600 text-zinc-100 transition-all"
              value={formData.valor}
              onChange={e => setFormData({ ...formData, valor: e.target.value })}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider py-4 rounded-2xl transition-all shadow-lg shadow-red-600/10 cursor-pointer text-xs"
        >
          {editandoId ? 'Atualizar Plano' : 'Criar Plano'}
        </button>
      </form>

      {/* LISTA */}
      <div className="space-y-3">
        {planos.length === 0 ? (
          <div className="bg-zinc-900/20 border border-zinc-800/80 border-dashed rounded-[2rem] p-12 text-center">
            <ClipboardList className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Nenhum plano configurado</p>
          </div>
        ) : (
          planos.map(plano => (
            <div
              key={plano.id}
              className="bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-850 p-5 rounded-[2rem] flex justify-between items-center group transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-red-500 group-hover:bg-red-500/5 transition-all">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-zinc-100 uppercase text-base italic leading-tight">
                    {plano.nome}
                  </h3>
                  <p className="text-emerald-500 font-bold text-xs flex items-center gap-0.5 mt-0.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    {plano.valor.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(plano)}
                  className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 border border-zinc-850 hover:border-red-500/20 rounded-xl transition-all duration-200 cursor-pointer"
                  title="Editar Plano"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExcluir(plano.id)}
                  className="p-3 text-zinc-450 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 rounded-xl transition-all duration-200 cursor-pointer"
                  title="Excluir Plano"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}