"use client";

import { useCallback, useEffect, useState, type DependencyList } from "react";

type ServiceState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

/**
 * Executa uma função da camada de serviços e controla os estados visuais
 * de carregamento, erro e sucesso. `reload` permite tentar de novo.
 */
export function useService<T>(loader: () => Promise<T>, deps: DependencyList = []) {
  const [state, setState] = useState<ServiceState<T>>({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(loader, deps);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    load()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((err: unknown) => {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Algo deu errado. Tente novamente.";
        setState({ data: null, error: message, loading: false });
      });

    return () => {
      active = false;
    };
  }, [load, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  /** Atualiza os dados localmente depois de uma ação (ex.: mudar status) sem recarregar a tela. */
  const setData = useCallback((updater: (current: T) => T) => {
    setState((prev) => (prev.data === null ? prev : { ...prev, data: updater(prev.data) }));
  }, []);

  return { ...state, reload, setData };
}
