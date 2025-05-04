import { useState, useEffect, ChangeEvent } from "react";

export type Provider = "openai" | "azure" | "openrouter" | "local";

export interface ModelOption {
  value: string;
  label: string;
}

export interface ProviderConfig {
  models: ModelOption[];
  description: string;
  requiresConnection?: boolean;
}

const OPENAI_MODELS: ModelOption[] = [
  { value: "gpt-4o-mini", label: "GPT-4o mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "o3-mini", label: "o3-mini" }
];

/**
 * サーバーからモデルリストを取得する関数
 * @param provider プロバイダー名
 * @param host LocalLLM用ホスト（localプロバイダーの場合のみ）
 * @param port LocalLLM用ポート（localプロバイダーの場合のみ）
 */
async function fetchModelsFromServer(
  provider: Provider,
  address?: string
): Promise<ModelOption[]> {
  try {
    const params = new URLSearchParams({ provider });
    if (provider === "local" && address) {
      params.append("address", address);
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASEPATH}/admin/models?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const models = await response.json();
    return models;
  } catch (error) {
    console.error(`${provider}モデルの取得に失敗しました:`, error);
    
    if (provider === "openrouter") {
      return [
        { value: "openai/gpt-4o", label: "OpenAI GPT-4o" },
        { value: "anthropic/claude-3-opus", label: "Anthropic Claude 3 Opus" },
        { value: "anthropic/claude-3-sonnet", label: "Anthropic Claude 3 Sonnet" }
      ];
    } else if (provider === "local") {
      return [
        { value: "llama3", label: "Llama 3" },
        { value: "mistral", label: "Mistral" },
        { value: "custom", label: "カスタムモデル" }
      ];
    }
    
    return [];
  }
}

/**
 * AIモデル設定を管理するカスタムフック
 */
export function useAISettings() {
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState<string>("gpt-4o-mini");
  const [workers, setWorkers] = useState<number>(30);
  const [isPubcomMode, setIsPubcomMode] = useState<boolean>(true);
  const [isEmbeddedAtLocal, setIsEmbeddedAtLocal] = useState<boolean>(false);
  
  const [localLLMAddress, setLocalLLMAddress] = useState<string>("localhost:11434");
  
  const [openRouterModels, setOpenRouterModels] = useState<ModelOption[]>([]);
  const [localLLMModels, setLocalLLMModels] = useState<ModelOption[]>([]);
  
  useEffect(() => {
    if (provider === "openrouter") {
      fetchModelsFromServer("openrouter").then(models => {
        setOpenRouterModels(models);
        if (models.length > 0) {
          setModel(models[0].value);
        }
      });
    }
  }, [provider]);
  
  useEffect(() => {
    if (provider === "local") {
      fetchModelsFromServer("local", localLLMAddress).then(models => {
        setLocalLLMModels(models);
        if (models.length > 0) {
          setModel(models[0].value);
        }
      });
    }
  }, [provider]);
  
  /**
   * LocalLLMのモデルリストを手動で取得
   */
  const fetchLocalLLMModels = async () => {
    if (provider === "local" && localLLMAddress) {
      try {
        const models = await fetchModelsFromServer("local", localLLMAddress);
        setLocalLLMModels(models);
        if (models.length > 0) {
          setModel(models[0].value);
        }
        return true;
      } catch (error) {
        console.error("LocalLLMモデルの取得に失敗しました:", error);
        return false;
      }
    }
    return false;
  };
  
  const providerConfigs: Record<Provider, ProviderConfig> = {
    openai: {
      models: OPENAI_MODELS,
      description: "OpenAI APIを使用します。OpenAIのAPIキーが必要です。"
    },
    azure: {
      models: OPENAI_MODELS, // Azureは同じモデルリストを使用
      description: "Azure OpenAI Serviceを使用します。Azureの設定が必要です。"
    },
    openrouter: {
      models: openRouterModels,
      description: "OpenRouterを使用して複数のモデルにアクセスします。（将来対応予定）"
    },
    local: {
      models: localLLMModels,
      description: "ローカルで実行されているLLMサーバーに接続します。（将来対応予定）",
      requiresConnection: true
    }
  };
  
  /**
   * プロバイダー変更時のハンドラー
   */
  const handleProviderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as Provider;
    setProvider(newProvider);
    
    if (providerConfigs[newProvider].models.length > 0) {
      setModel(providerConfigs[newProvider].models[0].value);
    }
  };

  /**
   * ワーカー数変更時のハンドラー
   */
  const handleWorkersChange = (value: number) => {
    setWorkers(Math.max(1, Math.min(100, value)));
  };

  /**
   * ワーカー数増加ハンドラー
   */
  const increaseWorkers = () => {
    setWorkers((prev: number) => Math.min(100, prev + 1));
  };

  /**
   * ワーカー数減少ハンドラー
   */
  const decreaseWorkers = () => {
    setWorkers((prev: number) => Math.max(1, prev - 1));
  };

  /**
   * モデル変更時のハンドラー
   */
  const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  /**
   * パブコムモード変更時のハンドラー
   */
  const handlePubcomModeChange = (checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") return;
    setIsPubcomMode(checked);
  };

  /**
   * モデル説明文を取得
   */
  const getModelDescription = () => {
    if (provider === "openai" || provider === "azure") {
      if (model === "gpt-4o-mini") {
        return "GPT-4o mini：最も安価に利用できるモデルです。価格の詳細はOpenAIが公開しているAPI料金のページをご参照ください。";
      } else if (model === "gpt-4o") {
        return "GPT-4o：gpt-4o-miniと比較して高性能なモデルです。性能は高くなりますが、gpt-4o-miniと比較してOpenAI APIの料金は高くなります。";
      } else if (model === "o3-mini") {
        return "o3-mini：gpt-4oよりも高度な推論能力を備えたモデルです。性能はより高くなりますが、gpt-4oと比較してOpenAI APIの料金は高くなります。";
      }
    }
    return "";
  };
  
  /**
   * プロバイダー説明文を取得
   */
  const getProviderDescription = () => {
    return providerConfigs[provider as Provider].description;
  };
  
  /**
   * 現在のプロバイダーのモデルリストを取得
   */
  const getCurrentModels = () => {
    return providerConfigs[provider as Provider].models;
  };
  
  /**
   * LocalLLM接続設定が必要かどうか
   */
  const requiresConnectionSettings = () => {
    return providerConfigs[provider as Provider].requiresConnection === true;
  };

  /**
   * AI設定をリセット
   */
  const resetAISettings = () => {
    setProvider("openai");
    setModel("gpt-4o-mini");
    setWorkers(30);
    setIsPubcomMode(true);
    setIsEmbeddedAtLocal(false);
    setLocalLLMAddress("localhost:11434");
    setOpenRouterModels([]);
    setLocalLLMModels([]);
  };

  return {
    provider,
    model,
    workers,
    isPubcomMode,
    isEmbeddedAtLocal,
    localLLMAddress,
    handleProviderChange,
    handleModelChange,
    handleWorkersChange,
    increaseWorkers,
    decreaseWorkers,
    handlePubcomModeChange,
    setLocalLLMAddress,
    getModelDescription,
    getProviderDescription,
    getCurrentModels,
    requiresConnectionSettings,
    resetAISettings,
    setIsEmbeddedAtLocal,
    fetchLocalLLMModels,
  };
}
