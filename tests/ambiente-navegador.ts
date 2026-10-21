/**
 * Prepara o Node.js para rodar a camada de serviços do modo demonstração,
 * que guarda os dados no localStorage do navegador.
 *
 * Deve ser importado antes dos serviços.
 */

class ArmazenamentoEmMemoria {
  private dados = new Map<string, string>();

  getItem(chave: string) {
    return this.dados.get(chave) ?? null;
  }

  setItem(chave: string, valor: string) {
    this.dados.set(chave, String(valor));
  }

  removeItem(chave: string) {
    this.dados.delete(chave);
  }

  clear() {
    this.dados.clear();
  }
}

// Sem a espera simulada do modo demonstração (veja delay() em mock/storage.ts)
Object.assign(process.env, { NODE_ENV: "test" });

Object.defineProperty(globalThis, "window", {
  value: {
    localStorage: new ArmazenamentoEmMemoria(),
    location: { origin: "http://localhost:3000" },
  },
  configurable: true,
});
