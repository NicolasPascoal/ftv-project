import { useEffect, useState } from 'react';
import { pagamentoService } from '../config/pagamentoService';
import type { Pagamento, PagamentoHistorico } from '../config/pagamentoService';
import { Calendar, Search, CheckCircle2, Clock, Check, Edit3, ShieldAlert } from 'lucide-react';

export default function Pagamentos() {
  const [aba, setAba] = useState<'pendentes' | 'historico'>('pendentes');
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [historico, setHistorico] = useState<PagamentoHistorico[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [novaData, setNovaData] = useState('');
  const [carregando, setCarregando] = useState(false);

  const carregarPendentes = async () => {
    try {
      setCarregando(true);
      const data = await pagamentoService.getPendentes(termoBusca);
      setPagamentos(data);
    } catch (err) {
      console.error("Erro ao buscar pagamentos:", err);
    } finally {
      setCarregando(false);
    }
  };

  const carregarHistorico = async () => {
    try {
      setCarregando(true);
      const data = await pagamentoService.getHistorico();
      setHistorico(data);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (aba === 'pendentes') {
      carregarPendentes();
    } else {
      carregarHistorico();
    }
  }, [aba, termoBusca]);

  const darBaixa = async (id: number) => {
    if (!confirm("Confirmar recebimento deste pagamento?")) return;

    try {
      await pagamentoService.darBaixa(id);
      setPagamentos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao processar baixa.");
    }
  };

  const abrirEdicaoData = (pag: Pagamento) => {
    setEditandoId(pag.id);
    setNovaData(pag.data_vencimento);
  };

  const salvarNovaData = async () => {
    if (!editandoId || !novaData) return;

    try {
      await pagamentoService.atualizarData(editandoId, novaData);
      setPagamentos(prev =>
        prev.map(p => p.id === editandoId ? { ...p, data_vencimento: novaData } : p)
      );
      setEditandoId(null);
    } catch (err) {
      console.error("Erro ao atualizar data:", err);
      alert("Erro ao salvar nova data.");
    }
  };

  const formatarData = (data: string) => {
    if (!data) return '—';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Modal de edição de data com design escuro */}
      {editandoId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 w-full max-w-sm rounded-[2rem] shadow-2xl space-y-6">
            <div>
              <h3 className="font-black text-zinc-100 uppercase text-base italic leading-tight">Alterar Vencimento</h3>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">
                {pagamentos.find(p => p.id === editandoId)?.praticante_nome}
              </p>
            </div>
            
            <input
              type="date"
              value={novaData}
              onChange={e => setNovaData(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-zinc-100 font-bold focus:outline-none focus:border-red-500 transition-colors text-sm"
            />
            
            <div className="flex gap-3">
              <button
                onClick={salvarNovaData}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase transition-colors cursor-pointer"
              >
                Confirmar
              </button>
              <button
                onClick={() => setEditandoId(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3.5 rounded-2xl font-black text-xs uppercase transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div>
        <p className="text-red-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-1">Módulo Financeiro</p>
        <h2 className="text-3xl font-black text-zinc-100 uppercase italic tracking-tighter">
          Pagamentos
        </h2>
      </div>

      {/* Abas Modernas com Ícones */}
      <div className="flex gap-2 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800/80">
        <button
          onClick={() => setAba('pendentes')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            aba === 'pendentes'
              ? 'bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700/50'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Clock className="w-4 h-4 text-red-500" />
          Pendentes
        </button>
        <button
          onClick={() => setAba('historico')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
            aba === 'historico'
              ? 'bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700/50'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Histórico
        </button>
      </div>

      {/* Campo de Busca */}
      {aba === 'pendentes' && (
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-650 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="PROCURAR ALUNO..."
            className="w-full bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 pl-11 text-xs font-semibold focus:outline-none focus:border-red-500 placeholder:text-zinc-600 text-zinc-100 transition-all"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
      )}

      {/* Loader */}
      {carregando && (
        <div className="text-center py-12">
          <span className="h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin inline-block" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">Buscando registros...</p>
        </div>
      )}

      {/* PENDENTES */}
      {!carregando && aba === 'pendentes' && (
        <div className="space-y-3">
          {pagamentos.length === 0 ? (
            <div className="bg-zinc-900/20 border border-zinc-800/80 border-dashed rounded-[2rem] p-12 text-center">
              <Check className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Nenhuma pendência financeira!</p>
            </div>
          ) : (
            pagamentos.map((pag) => (
              <div
                key={pag.id}
                className="bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-850 p-5 rounded-[2rem] flex justify-between items-center group transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
              >
                <div className="space-y-1.5">
                  <h3 className="font-black text-base uppercase text-zinc-100 tracking-tight italic">
                    {pag.praticante_nome}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase text-red-400 bg-red-950/20 border border-red-900/30 px-2.5 py-0.5 rounded-lg">
                      <Calendar className="w-3 h-3 text-red-500" />
                      Venc: {formatarData(pag.data_vencimento)}
                    </span>
                    <span className="text-zinc-750 text-xs">·</span>
                    <span className="flex items-center text-[10px] font-black uppercase text-zinc-400">
                      R$ {pag.valor.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => abrirEdicaoData(pag)}
                    className="p-3 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 rounded-xl transition-all cursor-pointer"
                    title="Editar Data"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => darBaixa(pag.id)}
                    className="bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase px-5 py-3 rounded-xl transition-all shadow-md shadow-red-600/10 cursor-pointer"
                  >
                    Dar Baixa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* HISTÓRICO */}
      {!carregando && aba === 'historico' && (
        <div className="space-y-3">
          {historico.length === 0 ? (
            <div className="bg-zinc-900/20 border border-zinc-800/80 border-dashed rounded-[2rem] p-12 text-center">
              <ShieldAlert className="w-8 h-8 text-zinc-650 mx-auto mb-3" />
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Nenhum pagamento registrado</p>
            </div>
          ) : (
            historico.map((h) => (
              <div
                key={h.id}
                className="bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-850 p-4 px-5 rounded-[1.75rem] flex justify-between items-center transition-all duration-300"
              >
                <div>
                  <h3 className="font-black text-sm uppercase text-zinc-100 tracking-tight italic">
                    {h.praticante_nome}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                    Pago em {formatarData(h.data_pagamento)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1 rounded-lg">
                    R$ {h.valor.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}