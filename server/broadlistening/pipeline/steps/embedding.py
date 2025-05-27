import os

import pandas as pd
import tiktoken
from tqdm import tqdm

from services.llm import request_to_embed


def embedding(config):
    print("LOG_LEVEL =", os.getenv("LOG_LEVEL"))
    model = config["embedding"]["model"]
    is_embedded_at_local = config["is_embedded_at_local"]
    provider = config["provider"]
    dataset = config["output_dir"]
    path = f"outputs/{dataset}/embeddings.pkl"

    df = pd.read_csv(f"outputs/{dataset}/args.csv", usecols=["arg-id", "argument"])
    arguments = df["argument"].tolist()
    arg_ids = df["arg-id"].tolist()

    # ✅ OpenAIなどのAPI利用時のみ、トークン数でバッチ分割
    if not is_embedded_at_local:
        tokenizer = tiktoken.encoding_for_model(model)
        MAX_TOTAL_TOKENS = 200_000

        batches = []
        current_batch = []
        current_tokens = 0

        for arg in arguments:
            tokens = len(tokenizer.encode(arg))
            if current_tokens + tokens > MAX_TOTAL_TOKENS:
                batches.append(current_batch)
                current_batch = []
                current_tokens = 0
            current_batch.append(arg)
            current_tokens += tokens

        if current_batch:
            batches.append(current_batch)
    else:
        # ローカル埋め込みならそのまま1バッチでOK
        batches = [arguments]

    embeddings = []
    for batch in tqdm(batches, desc="Embedding batches"):
        embeds = request_to_embed(batch, model, is_embedded_at_local, provider)
        embeddings.extend(embeds)

    out_df = pd.DataFrame([{"arg-id": arg_ids[i], "embedding": embeddings[i]} for i in range(len(embeddings))])
    out_df.to_pickle(path)
