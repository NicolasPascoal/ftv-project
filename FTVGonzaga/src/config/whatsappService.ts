const WHATSAPP_URL = "http://localhost:3001";

export const whatsappService = {
  async getStatus(): Promise<{ ready: boolean }> {
    try {
      const res = await fetch(`${WHATSAPP_URL}/status`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return { ready: false };
      return await res.json();
    } catch {
      return { ready: false };
    }
  }
};
