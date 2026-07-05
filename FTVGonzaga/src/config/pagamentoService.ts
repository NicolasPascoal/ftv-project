import { api } from "./api";

export interface Pagamento {
  id: number;
  praticante_nome: string;
  data_vencimento: string;
  valor: number;
}

export interface PagamentoHistorico {
  id: number;
  praticante_nome: string;
  data_pagamento: string;
  valor: number;
}

export const pagamentoService = {
  async getPendentes(busca: string): Promise<Pagamento[]> {
    const res = await api.get("/pagamentos/pendentes", {
      params: { busca }
    });
    return res.data;
  },

  async getHistorico(): Promise<PagamentoHistorico[]> {
    const res = await api.get("/pagamentos/historico");
    return res.data;
  },

  async darBaixa(id: number): Promise<void> {
    await api.put(`/pagamentos/${id}/baixar`);
  },

  async atualizarData(id: number, data_vencimento: string): Promise<void> {
    await api.put(`/pagamentos/${id}`, { data_vencimento });
  }
};