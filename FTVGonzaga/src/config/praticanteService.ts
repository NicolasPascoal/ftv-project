import { api } from "./api";

export interface Praticante {
  id: number;
  nome: string;
  telefone: string;
  plano_id: number;
  plano_nome: string;
  ativo: number;
  data_nascimento?: string;
}

export const praticanteService = {
  async getAll(status: number, busca: string): Promise<Praticante[]> {
    const res = await api.get(`/praticantes`, {
      params: {
        status_filtro: status,
        busca
      }
    });

    return res.data;
  },

  async getDashboard(busca: string, status_filtro: number = 1): Promise<any[]> {
    const res = await api.get(`/praticantes/dashboard`, {
      params: { busca, status_filtro }
    });
    return res.data.data;
  },

  async create(data: any) {
    const res = await api.post('/praticantes', data);
    return res.data;
  },

  async update(id: number, data: any) {
    const res = await api.put(`/praticantes/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`/praticantes/${id}`);
  }
};