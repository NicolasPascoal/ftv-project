import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../config/dashboardService';
import { whatsappService } from '../config/whatsappService';
import { XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, ClipboardList, DollarSign, Award } from 'lucide-react';

interface Estatisticas {
  ativos: number;
  planos: number;
  faturamento: number;
  planoLider: string;
  historico: { mes: string; valor: number }[];
  planosDist: { nome: string; quantidade: number }[];
}

const COLORS = ['#ef4444', '#f87171', '#b91c1c', '#dc2626', '#fca5a5'];

export default function Home() {
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    ativos: 0,
    planos: 0,
    faturamento: 0,
    planoLider: "---",
    historico: [],
    planosDist: []
  });
  const [whatsappOk, setWhatsappOk] = useState<boolean | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [praticantes, planos, relatorio] = await Promise.all([
          dashboardService.getPraticantesAtivos(),
          dashboardService.getPlanos(),
          dashboardService.getRelatorio()
        ]);

        setEstatisticas({
          ativos: praticantes.length,
          planos: planos.length,
          faturamento: relatorio.faturamento_mes,
          planoLider: relatorio.planos[0]?.nome || "---",
          historico: relatorio.historico || [],
          planosDist: relatorio.planos || []
        });

      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      }
    }

    async function checarWhatsapp() {
      const status = await whatsappService.getStatus();
      setWhatsappOk(status.ready);
    }

    carregarDados();
    checarWhatsapp();
  }, []);

  const faturamentoFormatado = estatisticas.faturamento
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-[10%] right-[10%] w-[35%] h-[35%] rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[40%] h-[40%] rounded-full bg-zinc-800/20 blur-[100px] pointer-events-none" />

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-red-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-1">Painel Administrativo</p>
          <h2 className="text-4xl font-black text-zinc-100 uppercase italic tracking-tighter leading-none">
            Visão Geral
          </h2>
        </div>
        
        {/* Status do WhatsApp (Sutil, no cabeçalho) */}
        <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-2xl backdrop-blur-md">
          {whatsappOk === null ? (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-600 animate-pulse" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Verificando WhatsApp...</span>
            </>
          ) : whatsappOk ? (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">WhatsApp Conectado</span>
            </>
          ) : (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">WhatsApp Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/praticantes" className="bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/80 hover:border-red-500/40 p-6 rounded-[2rem] shadow-xl flex justify-between items-center group transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/0 group-hover:from-red-600/5 transition-all duration-300" />
          <div className="relative z-10 space-y-1">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest group-hover:text-red-400 transition-colors">
              Alunos Ativos
            </p>
            <h3 className="text-4xl font-black text-zinc-100 italic">
              {estatisticas.ativos}
            </h3>
          </div>
          <div className="h-14 w-14 bg-zinc-900 border border-zinc-800/80 group-hover:border-red-500/20 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-red-500 group-hover:bg-red-500/5 transition-all duration-300 relative z-10">
            <Users className="w-6 h-6" />
          </div>
        </Link>

        <Link to="/planos" className="bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/80 hover:border-red-500/40 p-6 rounded-[2rem] shadow-xl flex justify-between items-center group transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/0 group-hover:from-red-600/5 transition-all duration-300" />
          <div className="relative z-10 space-y-1">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest group-hover:text-red-400 transition-colors">
              Planos Criados
            </p>
            <h3 className="text-4xl font-black text-zinc-100 italic">
              {estatisticas.planos}
            </h3>
          </div>
          <div className="h-14 w-14 bg-zinc-900 border border-zinc-800/80 group-hover:border-red-500/20 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-red-500 group-hover:bg-red-500/5 transition-all duration-300 relative z-10">
            <ClipboardList className="w-6 h-6" />
          </div>
        </Link>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-[2rem] shadow-xl flex justify-between items-center relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              Faturamento do Mês
            </p>
            <h3 className="text-3xl font-black text-zinc-100 italic tracking-tight">
              {faturamentoFormatado}
            </h3>
          </div>
          <div className="h-14 w-14 bg-zinc-900 border border-zinc-800/80 rounded-2xl flex items-center justify-center text-emerald-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Gráficos / Seção Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Histórico com Gráfico de Área Avançado */}
        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800/80 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px]">
          <div>
            <p className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em] mb-1">
              Desempenho Financeiro
            </p>
            <h4 className="text-lg font-black text-zinc-100 uppercase italic">Evolução Mensal</h4>
          </div>
          
          <div className="h-[220px] w-full mt-6 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={estatisticas.historico}>
                <defs>
                  <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="mes" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1.25rem', color: '#fff', fontSize: '11px' }}
                  itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                  labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', marginBottom: '4px' }}
                  formatter={(v: any) => [`R$ ${Number(v).toFixed(2).replace('.', ',')}`, 'Faturamento']}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorFaturamento)" 
                  dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#ffffff', stroke: '#ef4444', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Divisão por Planos */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between min-h-[350px]">
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 text-center">
              Mix de Alunos
            </p>
            <h4 className="text-lg font-black text-zinc-100 uppercase italic text-center">Planos Populares</h4>
          </div>
          
          <div className="h-[180px] w-full relative">
            {estatisticas.planosDist.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Sem dados</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estatisticas.planosDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={6}
                    dataKey="quantidade"
                    nameKey="nome"
                  >
                    {estatisticas.planosDist.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '1.25rem', backgroundColor: '#18181b', border: '1px solid #27272a', fontSize: '11px', color: '#fff' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800/60 p-4 rounded-2xl flex items-center justify-center gap-3">
            <Award className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-xs text-zinc-400 font-semibold text-center leading-tight">
              Plano Líder: <span className="text-zinc-200 font-bold uppercase italic">{estatisticas.planoLider}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Atalho Rápido para Pagamentos */}
      <Link to="/pagamentos" className="relative group block bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-800/80 hover:border-red-500/40 p-6 rounded-[2rem] transition-all duration-300 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-600/5 rounded-full blur-[60px] translate-x-20 -translate-y-20 pointer-events-none group-hover:bg-red-600/10 transition-colors" />
        <div className="flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <h4 className="text-zinc-100 font-black uppercase italic text-sm group-hover:text-red-400 transition-colors">
              Mensalidades & Fluxos
            </h4>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
              Acesse a cobrança, alteração de vencimento e baixas
            </p>
          </div>
          <span className="h-10 w-10 bg-zinc-900 group-hover:bg-red-500/10 border border-zinc-800 group-hover:border-red-500/30 text-zinc-400 group-hover:text-red-500 rounded-xl flex items-center justify-center font-black transition-all duration-300">
            →
          </span>
        </div>
      </Link>
    </div>
  );
}