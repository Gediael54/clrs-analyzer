import { useState, useEffect } from "react";

interface UseCLRSModuleReturn {
  module: any;
  isLoading: boolean;
  error: string | null;
}

export function useCLRSModule(): UseCLRSModuleReturn {
  const [module, setModule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Cria a tag script dinamicamente
    const script = document.createElement("script");
    script.src = "/wasm/clrs_engine.js";

    // 2. Callback disparado quando o script .js da cola do Emscripten é baixado
    script.onload = () => {
      if ((window as any).loadCLRSModule) {
        (window as any)
          .loadCLRSModule()
          .then((mod: any) => {
            setModule(mod);
            setIsLoading(false);
          })
          .catch((err: any) => {
            console.error("Erro ao inicializar WASM:", err);
            setError("Erro ao inicializar o módulo WebAssembly.");
            setIsLoading(false);
          });
      } else {
        setError("Função loadCLRSModule não encontrada no escopo global.");
        setIsLoading(false);
      }
    };

    // 3. Trata falhas de carregamento (ex: arquivo 404)
    script.onerror = () => {
      setError("Falha ao carregar o arquivo /wasm/clrs_engine.js.");
      setIsLoading(false);
    };

    // 4. Injeta o script no DOM
    document.body.appendChild(script);

    // 5. Cleanup: remove o script caso o componente seja desmontado
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return { module, isLoading, error };
}