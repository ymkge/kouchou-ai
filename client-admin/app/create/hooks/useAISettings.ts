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
 * OpenRouterからモデルリストを取得する関数
 * @see https://openrouter.ai/docs/api-reference/list-available-models
 */
async function fetchOpenRouterModels(): Promise<ModelOption[]> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data.data)) {
      return data.data.map((model: any) => {
        const modelId = model.id;
        const provider = model.provider || "unknown";
        const modelName = model.name || modelId;
        
        return {
          value: modelId,
          label: `${provider} - ${modelName}`
        };
      });
    }
    
    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("OpenRouterモデルの取得に失敗しました:", error);
    return [
      { value: "openai/gpt-4o", label: "OpenAI GPT-4o" },
      { value: "anthropic/claude-3-opus", label: "Anthropic Claude 3 Opus" },
      { value: "anthropic/claude-3-sonnet", label: "Anthropic Claude 3 Sonnet" }
    ];
  }
}

/**
 * LocalLLMからモデルリストを取得する関数
 * ホストとポートを指定してローカルで実行されているLLMサーバーからモデルリストを取得
 */
async function fetchLocalLLMModels(host: string, port: number): Promise<ModelOption[]> {
  try {
    const endpoint = `http://${host}:${port}/api/models`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data.models)) {
      return data.models.map((model: any) => ({
        value: model.id || model.name,
        label: model.name || model.id
      }));
    }
    
    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("LocalLLMモデルの取得に失敗しました:", error);
    return [
      { value: "llama3", label: "Llama 3" },
      { value: "mistral", label: "Mistral" },
      { value: "custom", label: "カスタムモデル" }
    ];
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
  
  const [localLLMHost, setLocalLLMHost] = useState<string>("localhost");
  const [localLLMPort, setLocalLLMPort] = useState<number>(11434);
  
  const [openRouterModels, setOpenRouterModels] = useState<ModelOption[]>([]);
  const [localLLMModels, setLocalLLMModels] = useState<ModelOption[]>([]);
  
  useEffect(() => {
    if (provider === "openrouter") {
      fetchOpenRouterModels().then(models => {
        setOpenRouterModels(models);
        if (models.length > 0) {
          setModel(models[0].value);
        }
      });
    }
  }, [provider]);
  
  useEffect(() => {
    if (provider === "local") {
      fetchLocalLLMModels(localLLMHost, localLLMPort).then(models => {
        setLocalLLMModels(models);
        if (models.length > 0) {
          setModel(models[0].value);
        }
      });
    }
  }, [provider, localLLMHost, localLLMPort]);
  
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
    if (provider === "openai") {
      if (model === "gpt-4o-mini") {
        return "GPT-4o mini：最も安価に利用できるモデルです。価格の詳細はOpenAIが公開しているAPI料金のページをご参照ください。";
      } else if (model === "gpt-4o") {
        return "GPT-4o：gpt-4o-miniと比較して高性能なモデルです。性能は高くなりますが、gpt-4o-miniと比較してOpenAI APIの料金は高くなります。";
      } else if (model === "o3-mini") {
        return "o3-mini：gpt-4oよりも高度な推論能力を備えたモデルです。性能はより高くなりますが、gpt-4oと比較してOpenAI APIの料金は高くなります。";
      }
    } else if (provider === "azure") {
      if (model === "gpt-4") {
        return "GPT-4：Azureで利用可能な高性能モデルです。";
      } else if (model === "gpt-35-turbo") {
        return "GPT-3.5 Turbo：Azureで利用可能な高速かつ経済的なモデルです。";
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
    setLocalLLMHost("localhost");
    setLocalLLMPort(11434);
    setOpenRouterModels([]);
    setLocalLLMModels([]);
  };

  return {
    provider,
    model,
    workers,
    isPubcomMode,
    isEmbeddedAtLocal,
    localLLMHost,
    localLLMPort,
    handleProviderChange,
    handleModelChange,
    handleWorkersChange,
    increaseWorkers,
    decreaseWorkers,
    handlePubcomModeChange,
    setLocalLLMHost,
    setLocalLLMPort,
    getModelDescription,
    getProviderDescription,
    getCurrentModels,
    requiresConnectionSettings,
    resetAISettings,
    setIsEmbeddedAtLocal,
  };
}
