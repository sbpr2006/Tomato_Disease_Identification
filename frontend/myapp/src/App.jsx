import { useCallback, useRef, useState } from "react";
import "./App.css";

// ---------------------------------------------------------------------------
// Model class names, in the exact order/spelling the model outputs them.
// Keep this array in sync with `class_names` on the Python side — it's what
// a real API response's `label` field should match.
// ---------------------------------------------------------------------------
const CLASS_NAMES = [
  "Tomato_Bacterial_spot",
  "Tomato_Early_blight",
  "Tomato_Late_blight",
  "Tomato_Leaf_Mold",
  "Tomato_Septoria_leaf_spot",
  "Tomato_Spider_mites_Two_spotted_spider_mite",
  "Tomato__Target_Spot",
  "Tomato__Tomato_YellowLeaf__Curl_Virus",
  "Tomato__Tomato_mosaic_virus",
  "Tomato_healthy",
];

// Display label, severity, and care tip for each raw class name.
const CLASS_INFO = {
  Tomato_Bacterial_spot: {
    label: "Bacterial Spot",
    severity: "disease",
    tip: "Avoid handling wet foliage and rotate crops next season.",
  },
  Tomato_Early_blight: {
    label: "Early Blight",
    severity: "disease",
    tip: "Remove the affected lower leaves and improve airflow around the plant.",
  },
  Tomato_Late_blight: {
    label: "Late Blight",
    severity: "disease",
    tip: "Isolate the plant and apply a copper-based fungicide right away.",
  },
  Tomato_Leaf_Mold: {
    label: "Leaf Mold",
    severity: "caution",
    tip: "Increase ventilation and bring the humidity down around the canopy.",
  },
  Tomato_Septoria_leaf_spot: {
    label: "Septoria Leaf Spot",
    severity: "disease",
    tip: "Prune the infected leaves and avoid watering the foliage directly.",
  },
  Tomato_Spider_mites_Two_spotted_spider_mite: {
    label: "Two-Spotted Spider Mite",
    severity: "caution",
    tip: "Rinse the leaf undersides and introduce predatory mites if the spread continues.",
  },
  Tomato__Target_Spot: {
    label: "Target Spot",
    severity: "disease",
    tip: "Remove infected leaves and space plants further apart for airflow.",
  },
  Tomato__Tomato_YellowLeaf__Curl_Virus: {
    label: "Yellow Leaf Curl Virus",
    severity: "disease",
    tip: "Control whiteflies and remove infected plants to stop the spread.",
  },
  Tomato__Tomato_mosaic_virus: {
    label: "Mosaic Virus",
    severity: "disease",
    tip: "Disinfect tools between plants and avoid tobacco contact — it spreads the virus.",
  },
  Tomato_healthy: {
    label: "Healthy",
    severity: "healthy",
    tip: "No signs of disease. Keep the watering rhythm you've got.",
  },
};

const SEVERITY_COPY = {
  healthy: "Looking healthy",
  caution: "Keep an eye on it",
  disease: "Treatment recommended",
};

async function runDiagnosis(file) {
  const formData = new FormData();
  formData.append("file", file); // your FastAPI param is named "file"

  const API_URL = import.meta.env.VITE_API_URL;

const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: formData
});

  if (!res.ok) {
    throw new Error(`Prediction failed: ${res.status} ${res.statusText}`);
  }

  const { prediction, confidence } = await res.json(); // "prediction", not "label"

  const info = CLASS_INFO[prediction];
  if (!info) {
    throw new Error(`Unknown class returned by model: "${prediction}"`);
  }

  return { ...info, confidence: Math.round(confidence * 100) };
}

// ---------------------------------------------------------------------------
// Decorative leaf-vein mark — the page's signature element. Reused as the
// header glyph, the dropzone frame corners, and the confidence gauge ring.
// ---------------------------------------------------------------------------
function LeafMark({ className = "", strokeWidth = 1.4 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32 6C18 14 8 26 8 40c0 10 8 18 18 18s18-9 18-19c0-16-8-27-12-33Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path d="M32 10v44" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M32 20c-5 1-10 4-12 9" stroke="currentColor" strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
      <path d="M32 30c-6 1.5-12 5-14 11" stroke="currentColor" strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
      <path d="M32 20c5 1 10 4 12 9" stroke="currentColor" strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
      <path d="M32 30c6 1.5 12 5 14 11" stroke="currentColor" strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
    </svg>
  );
}

function ConfidenceGauge({ value, severity }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = (value / 100) * circumference;

  return (
    <div className={`gauge gauge--${severity}`} role="img" aria-label={`${value} percent confidence`}>
      <svg viewBox="0 0 128 128" width="128" height="128">
        <circle cx="64" cy="64" r={radius} className="gauge__track" strokeWidth="6" fill="none" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          className="gauge__fill"
          strokeWidth="6"
          fill="none"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
        />
      </svg>
      <div className="gauge__readout">
        <span className="gauge__number">{value}</span>
        <span className="gauge__percent">%</span>
      </div>
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

const acceptFile = useCallback((selected) => {
  if (!selected || !selected.type.startsWith("image/")) return;
  setFile(selected);
  setPreviewUrl(URL.createObjectURL(selected));
  setResult(null);
  setStatus("loading");
  runDiagnosis(selected)
    .then((r) => {
      setResult(r);
      setStatus("done");
    })
    .catch((err) => {
      console.error("Diagnosis error:", err);
      setStatus("error");
    });
}, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      acceptFile(e.dataTransfer.files?.[0]);
    },
    [acceptFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const hasImage = Boolean(previewUrl);

  return (
    <div className="page">
      <div className="page__ambient" aria-hidden="true" />

      <header className="header">
        <div className="header__eyebrow">
          <LeafMark className="header__mark" />
          <span>Tomato Leaf Clinic</span>
        </div>
        <h1 className="header__title">
          Show me the leaf, <em>I'll name the trouble.</em>
        </h1>
        <p className="header__sub">
          Drop a photo of a tomato leaf and get a diagnosis with a confidence reading, in seconds.
        </p>
      </header>

      <main className={`workspace ${hasImage ? "workspace--split" : "workspace--hero"}`}>
        {/* ------------------------------ Dropzone ------------------------------ */}
        <section
          className={`dropzone ${dragActive ? "dropzone--active" : ""} ${hasImage ? "dropzone--filled" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload a tomato leaf photo"
        >
          <LeafMark className="dropzone__corner dropzone__corner--tl" strokeWidth={1} />
          <LeafMark className="dropzone__corner dropzone__corner--br" strokeWidth={1} />

          {hasImage ? (
            <img src={previewUrl} alt="Uploaded tomato leaf" className="dropzone__preview" />
          ) : null}

          <div className="dropzone__glass">
            {!hasImage && (
              <>
                <LeafMark className="dropzone__icon" strokeWidth={1.6} />
                <p className="dropzone__title">Drag a leaf photo here</p>
                <p className="dropzone__hint">or click to browse · JPG or PNG</p>
              </>
            )}
            {hasImage && (
              <button
                type="button"
                className="dropzone__replace"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                Replace photo
              </button>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="dropzone__input"
            onChange={(e) => acceptFile(e.target.files?.[0])}
          />
        </section>

        {/* -------------------------------- Result ------------------------------- */}
        {hasImage && (
          <section
            className={`result result--${status} ${result ? `result--${result.severity}` : ""}`}
            style={previewUrl ? { "--result-bg": `url(${previewUrl})` } : undefined}
            aria-live="polite"
          >
            <div className="result__scrim" />

            {status === "loading" && (
              <div className="result__body result__body--loading">
                <span className="result__eyebrow">Diagnosis</span>
                <p className="result__loading-text">Reading the leaf…</p>
                <div className="result__spinner" aria-hidden="true" />
              </div>
            )}

            {status === "done" && result && (
              <div className="result__body">
                <span className="result__eyebrow">Diagnosis</span>
                <h2 className="result__label">{result.label}</h2>

                <div className="result__row">
                  <ConfidenceGauge value={result.confidence} severity={result.severity} />
                  <div className="result__meta">
                    <span className={`pill pill--${result.severity}`}>
                      {SEVERITY_COPY[result.severity]}
                    </span>
                    <p className="result__tip">{result.tip}</p>
                  </div>
                </div>

                <button type="button" className="result__reset" onClick={handleReset}>
                  Scan another leaf
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Built for field diagnosis of tomato leaf disease. Not a substitute for a professional lab test.</p>
      </footer>
    </div>
  );
}
