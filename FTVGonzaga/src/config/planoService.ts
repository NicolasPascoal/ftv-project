import { api } from "./api";

export interface Plano {
  id: number;
  nome: string;
  valor: number;
}

export const planoService = {
  async getAll(): Promise<Plano[]> {
    const res = await api.get("/planos");
    return res.data;
  },

  async create(data: { nome: string; valor: number }): Promise<Plano> {
  const res = await api.post("/planos", data);
  return res.data; // 🔥 ESSENCIAL
},

async update(id: number, data: { nome: string; valor: number }): Promise<Plano> {
  const res = await api.put(`/planos/${id}`, data);
  return res.data; // 🔥 ESSENCIAL
},

  async delete(id: number) {
    return api.delete(`/planos/${id}`);
  }
};