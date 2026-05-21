import requests
import numpy as np
from app.config import HF_API_TOKEN

MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"
API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL_ID}/pipeline/feature-extraction"

headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

def get_embeddings(texts: list[str]) -> list[list[float]]:
    response = requests.post(
        API_URL,
        headers=headers,
        json={"inputs": texts}
    )

    if response.status_code != 200:
        raise Exception(f"HF API error: {response.status_code} - {response.text}")

    return response.json()