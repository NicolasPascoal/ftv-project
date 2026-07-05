import { api } from "./api";

export interface Relatorio {
  faturamento_mes: number;
  planos: { nome: string; quantidade: number }[];
  historico: { mes: string; valor: number }[];
}

export const dashboardService = {
  async getPraticantesAtivos() {
    const res = await api.get<any[]>("/praticantes?status_filtro=1");
    return res.data;
  },

  async getPlanos() {
    const res = await api.get<any[]>("/planos");
    return res.data;
  },

  async getRelatorio(): Promise<Relatorio> {
    const res = await api.get<Relatorio>("/relatorios/geral");
    return res.data;
  }
};