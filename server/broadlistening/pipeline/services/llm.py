import logging
import os

import openai
from dotenv import load_dotenv
from openai import AzureOpenAI, OpenAI
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential
from pydantic import BaseModel


DOTENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../.env"))
load_dotenv(DOTENV_PATH)

# check env
use_azure = os.getenv("USE_AZURE", "false").lower()
if use_azure == "true":
    if not os.getenv("AZURE_CHATCOMPLETION_ENDPOINT"):
        raise RuntimeError("AZURE_CHATCOMPLETION_ENDPOINT environment variable is not set")
    if not os.getenv("AZURE_CHATCOMPLETION_DEPLOYMENT_NAME"):
        raise RuntimeError("AZURE_CHATCOMPLETION_DEPLOYMENT_NAME environment variable is not set")
    if not os.getenv("AZURE_CHATCOMPLETION_API_KEY"):
        raise RuntimeError("AZURE_CHATCOMPLETION_API_KEY environment variable is not set")
    if not os.getenv("AZURE_CHATCOMPLETION_VERSION"):
        raise RuntimeError("AZURE_CHATCOMPLETION_VERSION environment variable is not set")
    if not os.getenv("AZURE_EMBEDDING_ENDPOINT"):
        raise RuntimeError("AZURE_EMBEDDING_ENDPOINT environment variable is not set")
    if not os.getenv("AZURE_EMBEDDING_API_KEY"):
        raise RuntimeError("AZURE_EMBEDDING_API_KEY environment variable is not set")
    if not os.getenv("AZURE_EMBEDDING_VERSION"):
        raise RuntimeError("AZURE_EMBEDDING_VERSION environment variable is not set")
    if not os.getenv("AZURE_EMBEDDING_DEPLOYMENT_NAME"):
        raise RuntimeError("AZURE_EMBEDDING_DEPLOYMENT_NAME environment variable is not set")


@retry(
    retry=retry_if_exception_type(openai.RateLimitError),
    wait=wait_exponential(multiplier=3, min=3, max=20),
    stop=stop_after_attempt(3),
    reraise=True,
)
def request_to_openai(
    messages: list[dict],
    model: str = "gpt-4",
    is_json: bool = False,
    json_schema: dict|BaseModel = None,
) -> dict:
    openai.api_type = "openai"
    
    try:
        if isinstance(json_schema, type) and issubclass(json_schema, BaseModel):
            # Use beta.chat.completions.create for Pydantic BaseModel
            response = openai.beta.chat.completions.parse(
                model=model,
                messages=messages,
                temperature=0,
                n=1,
                seed=0,
                response_format=json_schema,
                timeout=30,
            )
            return response.choices[0].message.content

        else:
            response_format = None
            if is_json:
                response_format = {"type": "json_object"}
            elif json_schema:
                response_format = json_schema
            
            response = openai.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0,
                n=1,
                seed=0,
                response_format=response_format,
                timeout=30,
            )

            return response.choices[0].message.content
    except openai.RateLimitError as e:
        logging.warning(f"OpenAI API rate limit hit: {e}")
        raise
    except openai.AuthenticationError as e:
        logging.error(f"OpenAI API authentication error: {str(e)}")
        raise
    except openai.BadRequestError as e:
        logging.error(f"OpenAI API bad request error: {str(e)}")
        raise


@retry(
    retry=retry_if_exception_type(openai.RateLimitError),
    wait=wait_exponential(multiplier=1, min=2, max=20),
    stop=stop_after_attempt(3),
    reraise=True,
)
def request_to_azure_chatcompletion(
    messages: list[dict],
    is_json: bool = False,
    json_schema: dict|BaseModel = None,
) -> dict:
    azure_endpoint = os.getenv("AZURE_CHATCOMPLETION_ENDPOINT")
    deployment = os.getenv("AZURE_CHATCOMPLETION_DEPLOYMENT_NAME")
    api_key = os.getenv("AZURE_CHATCOMPLETION_API_KEY")
    api_version = os.getenv("AZURE_CHATCOMPLETION_VERSION")

    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=azure_endpoint,
        api_key=api_key,
    )

    # Set response format based on parameters

    try:
        if isinstance(json_schema, type) and issubclass(json_schema, BaseModel):
            # Use beta.chat.completions.create for Pydantic BaseModel (Azure)
            response = client.beta.chat.completions.parse(
                model=deployment,
                messages=messages,
                temperature=0,
                n=1,
                seed=0,
                response_model=json_schema,
                timeout=30,
            )
            return response
        else:
            response_format = None
            if is_json:
                response_format = {"type": "json_object"}
            elif json_schema:
                response_format = json_schema
            
            response = client.chat.completions.create(
                model=deployment,
                messages=messages,
                temperature=0,
                n=1,
                seed=0,
                response_format=response_format,
                timeout=30,
            )
            return response.choices[0].message.content
    except openai.RateLimitError as e:
        logging.warning(f"OpenAI API rate limit hit: {e}")
        raise
    except openai.AuthenticationError as e:
        logging.error(f"OpenAI API authentication error: {str(e)}")
        raise
    except openai.BadRequestError as e:
        logging.error(f"OpenAI API bad request error: {str(e)}")
        raise


def request_to_chat_openai(
    messages: list[dict],
    model: str = "gpt-4o",
    is_json: bool = False,
    json_schema: dict = None,
) -> dict:
    use_azure = os.getenv("USE_AZURE", "false").lower()
    if use_azure == "true":
        return request_to_azure_chatcompletion(messages, is_json, json_schema)
    else:
        return request_to_openai(messages, model, is_json, json_schema)


EMBDDING_MODELS = [
    "text-embedding-3-large",
    "text-embedding-3-small",
]


def _validate_model(model):
    if model not in EMBDDING_MODELS:
        raise RuntimeError(f"Invalid embedding model: {model}, available models: {EMBDDING_MODELS}")


def request_to_embed(args, model):
    use_azure = os.getenv("USE_AZURE", "false").lower()
    if use_azure == "true":
        return request_to_azure_embed(args, model)

    else:
        _validate_model(model)
        client = OpenAI()
        response = client.embeddings.create(input=args, model=model)
        embeds = [item.embedding for item in response.data]
    return embeds


def request_to_azure_embed(args, model):
    azure_endpoint = os.getenv("AZURE_EMBEDDING_ENDPOINT")
    api_key = os.getenv("AZURE_EMBEDDING_API_KEY")
    api_version = os.getenv("AZURE_EMBEDDING_VERSION")
    deployment = os.getenv("AZURE_EMBEDDING_DEPLOYMENT_NAME")

    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=azure_endpoint,
        api_key=api_key,
    )

    response = client.embeddings.create(input=args, model=deployment)
    return [item.embedding for item in response.data]


def _test():
    # messages = [
    #     {"role": "system", "content": "英訳せよ"},
    #     {"role": "user", "content": "これはテストです"},
    # ]
    # response = request_to_chat_openai(messages=messages, model="gpt-4o", is_json=False)
    # print(response)
    # print(request_to_embed("Hello", "text-embedding-3-large"))
    print(request_to_azure_embed("Hello", "text-embedding-3-large"))


def _jsonschema_test():
    # JSON schema request example
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "TranslationResponseModel",
            "schema": {
                "type": "object",
                "properties": {
                    "translation": {"type": "string", "description": "英訳結果"},
                    "politeness": {"type": "string", "description": "丁寧さのレベル（例: casual, polite, honorific）"}
                },
                "required": ["translation", "politeness"]
            }
        }
    }

    messages = [
        {"role": "system", "content": "あなたは翻訳者です。日本語を英語に翻訳してください。翻訳と丁寧さのレベルをJSON形式で返してください。"},
        {"role": "user", "content": "これは素晴らしい日です。"}
    ]
    
    response = request_to_chat_openai(
        messages=messages,
        model="gpt-4o",
        json_schema=response_format
    )
    print("JSON Schema response example:")
    print(response)

def _basemodel_test():
    # pydanticのBaseModelを使ってOpenAI APIにスキーマを指定してリクエストするテスト
    from pydantic import BaseModel, Field
    class CalendarEvent(BaseModel):
        name: str = Field(..., description="イベント名")
        date: str = Field(..., description="日付")
        participants: list[str] = Field(..., description="参加者")

    messages=[
        {"role": "system", "content": "Extract the event information."},
        {"role": "user", "content": "Alice and Bob are going to a science fair on Friday."},
    ]

    response = request_to_chat_openai(
        messages=messages,
        model="gpt-4o",
        json_schema=CalendarEvent
    )
    
    print("Pydantic(BaseModel) schema response example:")
    print(response)


if __name__ == "__main__":
    #_test()
    #_test()
    #_jsonschema_test()
    #_basemodel_test()
    pass
