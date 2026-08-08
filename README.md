# 🍅 Tomato Leaf Disease Classifier

A full-stack tomato leaf disease diagnosis tool — upload a leaf photo, get an instant prediction powered by a TensorFlow Serving model, displayed through a clean React interface.

---

## 📁 Project Structure

```
.
├── api/                  # FastAPI backend
│   └── main.py           # Prediction endpoint
├── frontend/
│   └── myapp/            # React + Vite frontend
├── models/               # Saved TensorFlow model versions
└── train/                # Training notebook, weights & dataset files
```

---

## ✨ Features

- 🖼️ **Drag-and-drop image upload** via a responsive React UI
- ⚡ **FastAPI backend** — handles `multipart/form-data` image uploads at `POST /predict`
- 🤖 **TensorFlow Serving integration** — forwards images to a model server and returns predictions
- 📊 **Confidence score** returned alongside each predicted disease class
- 🌿 Detects **10 tomato leaf conditions** including healthy leaves

---

## 🦠 Supported Disease Classes

| Class | Description |
|---|---|
| `Tomato_Bacterial_spot` | Bacterial Spot |
| `Tomato_Early_blight` | Early Blight |
| `Tomato_Late_blight` | Late Blight |
| `Tomato_Leaf_Mold` | Leaf Mold |
| `Tomato_Septoria_leaf_spot` | Septoria Leaf Spot |
| `Tomato_Spider_mites_Two_spotted_spider_mite` | Two-Spotted Spider Mite |
| `Tomato__Target_Spot` | Target Spot |
| `Tomato__Tomato_YellowLeaf__Curl_Virus` | Yellow Leaf Curl Virus |
| `Tomato__Tomato_mosaic_virus` | Mosaic Virus |
| `Tomato_healthy` | Healthy |

---

## 🛠️ Requirements

| Tool | Version |
|---|---|
| Python | 3.x |
| Node.js / npm | 18+ |
| TensorFlow Serving | Running at `http://localhost:8999` |

---

## 🚀 Getting Started

### 1 — TensorFlow Serving

Make sure your model server is running and reachable at:

```
http://localhost:8999/v1/models/tmt_model:predict
```

---

### 2 — Backend Setup

```bash
# Install Python dependencies
pip install fastapi uvicorn requests pillow numpy

# Start the API server
python api/main.py
```

The backend will be available at **`http://localhost:9090`**.

**Endpoint**

```
POST /predict
Content-Type: multipart/form-data

file: <image file>
```

**Response**

```json
{
  "prediction": "Tomato_Early_blight",
  "confidence": 0.97
}
```

---

### 3 — Frontend Setup

```bash
# Move into the frontend directory
cd frontend/myapp

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open the local URL printed in the terminal (typically **`http://localhost:5173`**).

---

## 🔄 How It Works

```
User uploads image
      │
      ▼
React frontend (localhost:5173)
      │  POST /predict  (multipart/form-data)
      ▼
FastAPI backend (localhost:9090)
      │  POST /v1/models/tmt_model:predict  (JSON)
      ▼
TensorFlow Serving (localhost:8999)
      │  Returns class probabilities
      ▼
FastAPI returns { prediction, confidence }
      │
      ▼
Frontend displays diagnosis + confidence score
```

---

## ⚠️ Notes

- The backend requires a live TensorFlow Serving instance — predictions will fail without it.
- This tool is intended for **field-level diagnosis assistance** and is not a substitute for a professional lab test.
- Training assets and model checkpoints are available in the `train/` directory.

---

## 📄 License

This project is for educational and research purposes.
