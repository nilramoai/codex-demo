from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64

from backend.utils import create_image, edit_image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateRequest(BaseModel):
    prompt: str
    size: str = "1024x1024"


class EditRequest(BaseModel):
    prompt: str
    image_base64: str


@app.get("/")
def read_root():
    return {"status": "ok"}


@app.post("/api/create")
def create_image_endpoint(payload: CreateRequest):
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required.")

    image_bytes = create_image(prompt=payload.prompt, size=payload.size)
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    return {"image_base64": image_base64}


@app.post("/api/edit")
def edit_image_endpoint(payload: EditRequest):
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Edit prompt is required.")

    try:
        image_bytes = base64.b64decode(payload.image_base64)
    except base64.binascii.Error as exc:
        raise HTTPException(status_code=400, detail="Invalid image data.") from exc

    edited_bytes = edit_image(prompt=payload.prompt, image_bytes=image_bytes)
    edited_base64 = base64.b64encode(edited_bytes).decode("utf-8")
    return {"image_base64": edited_base64}
