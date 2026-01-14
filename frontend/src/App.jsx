import { useState } from "react";
import "./App.css";

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";

const sizeOptions = ["1024x1024", "1536x1024", "1024x1536", "auto"];

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generatedBase64, setGeneratedBase64] = useState("");
  const [generateStatus, setGenerateStatus] = useState("idle");
  const [generateError, setGenerateError] = useState("");

  const [editPrompt, setEditPrompt] = useState("");
  const [editedImage, setEditedImage] = useState("");
  const [editStatus, setEditStatus] = useState("idle");
  const [editError, setEditError] = useState("");

  const handleGenerate = async (event) => {
    event.preventDefault();
    setGenerateStatus("loading");
    setGenerateError("");
    setGeneratedImage("");
    setGeneratedBase64("");
    setEditedImage("");

    try {
      const response = await fetch(`${apiBase}/api/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, size }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Failed to generate image.");
      }

      const data = await response.json();
      const imageBase64 = data.image_base64;
      setGeneratedBase64(imageBase64);
      setGeneratedImage(`data:image/png;base64,${imageBase64}`);
      setGenerateStatus("success");
    } catch (error) {
      setGenerateStatus("error");
      setGenerateError(error.message);
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    setEditStatus("loading");
    setEditError("");
    setEditedImage("");

    try {
      if (!generatedBase64) {
        throw new Error("Generate an image before editing.");
      }

      const response = await fetch(`${apiBase}/api/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: editPrompt,
          image_base64: generatedBase64,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Failed to edit image.");
      }

      const data = await response.json();
      setEditedImage(`data:image/png;base64,${data.image_base64}`);
      setEditStatus("success");
    } catch (error) {
      setEditStatus("error");
      setEditError(error.message);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">OpenAI image-gen-1 demo</p>
          <h1>Generate and edit images with prompts</h1>
          <p className="subtitle">
            Use the left column to generate an image, then refine it with an edit
            prompt in the right column.
          </p>
        </div>
      </header>

      <main className="grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Generate an image</h2>
            <p>Describe what you want the model to create.</p>
          </div>
          <form onSubmit={handleGenerate} className="form">
            <label className="field">
              <span>Prompt</span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="A cinematic photo of a lighthouse on a cliff at sunset"
                rows={4}
                required
              />
            </label>
            <label className="field">
              <span>Output size</span>
              <select value={size} onChange={(event) => setSize(event.target.value)}>
                {sizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={generateStatus === "loading"}>
              {generateStatus === "loading" ? "Generating..." : "Generate image"}
            </button>
            {generateError && <p className="error">{generateError}</p>}
          </form>

          <div className="preview">
            {generatedImage ? (
              <img src={generatedImage} alt="Generated" />
            ) : (
              <div className="placeholder">
                <p>Your generated image will appear here.</p>
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Edit the generated image</h2>
            <p>Refine the last generated image with an edit prompt.</p>
          </div>
          <form onSubmit={handleEdit} className="form">
            <label className="field">
              <span>Edit prompt</span>
              <textarea
                value={editPrompt}
                onChange={(event) => setEditPrompt(event.target.value)}
                placeholder="Add stormy clouds and dramatic lighting"
                rows={4}
                required
              />
            </label>
            <button type="submit" disabled={editStatus === "loading"}>
              {editStatus === "loading" ? "Editing..." : "Edit image"}
            </button>
            {editError && <p className="error">{editError}</p>}
          </form>

          <div className="preview">
            {editedImage ? (
              <img src={editedImage} alt="Edited" />
            ) : (
              <div className="placeholder">
                <p>Your edited image will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
