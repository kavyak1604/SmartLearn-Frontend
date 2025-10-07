import { useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("summarize");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);

  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [flippedCards, setFlippedCards] = useState([]);
  const [mode, setMode] = useState("short");
  const [difficulty, setDifficulty] = useState("medium");

  // -------------------- Auth --------------------
  const handleAuth = async () => {
    try {
      if (authMode === "register") {
        const res = await fetch("http://localhost:8000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, full_name: fullName, password }),
        });
        const data = await res.json();
        alert(data.message || data.detail);
        if (res.ok) setAuthMode("login");
        return;
      }

      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });
      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    }
  };

  // -------------------- API --------------------
  const callAPI = async (endpoint, isFile = false) => {
    try {
      let options = {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      };

      if (isFile) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mode", mode);
        options.body = formData;
      } else {
        let payload = { text };
        if (activeTab === "summarize") payload.mode = mode;
        if (activeTab === "quiz") payload.difficulty = difficulty;
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(payload);
      }

      const response = await fetch(`http://localhost:8000/${endpoint}`, options);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({ error: "⚠️ Error connecting to backend" });
    }
  };

  // -------------------- Auth UI --------------------
  if (!token) {
    return (
      <div className="auth">
        <h1>{authMode === "login" ? "🔑 Login" : "📝 Register"}</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {authMode === "register" && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleAuth}>
          {authMode === "login" ? "Login" : "Register"}
        </button>
        <p onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
          {authMode === "login"
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </p>
      </div>
    );
  }

  // -------------------- Flashcard Flip --------------------
  const toggleFlip = (index) => {
    setFlippedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // -------------------- Render Results --------------------
  const renderResults = () => {
    if (!result) return null;

    const renderFlashcards = (flashcardsText) => (
      <div className="flashcards">
        <h3>🎴 Flashcards</h3>
        {flashcardsText.split("\n").map((line, i) => {
          if (!line.includes(":")) return null;
          const [term, def] = line.split(":");
          const isFlipped = flippedCards.includes(i);
          return (
            <div
              key={i}
              className={`flashcard ${isFlipped ? "flipped" : ""}`}
              onClick={() => toggleFlip(i)}
            >
              <div className="flashcard-inner">
                <div className="flashcard-front">
                  <strong>{term.trim()}</strong>
                </div>
                <div className="flashcard-back">
                  <p>{def.trim()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return (
      <div>
        {result.summary && (
          <p>
            <strong>📖 Summary:</strong> {result.summary}
          </p>
        )}
        {result.quiz && (
          <div>
            <h3>📝 Quiz</h3>
            <pre>{result.quiz}</pre>
          </div>
        )}
        {result.keywords && (
          <div>
            <h3>🔑 Keywords</h3>
            <ul>
              {result.keywords.split("\n").map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          </div>
        )}
        {result.flashcards && renderFlashcards(result.flashcards)}
      </div>
    );
  };

  // -------------------- Main UI --------------------
  return (
    <div className="app">
      <h1>🎮 Adaptive Agent</h1>
      <button
        style={{ float: "right", marginBottom: "10px" }}
        onClick={() => {
          localStorage.removeItem("token");
          setToken(null);
        }}
      >
        🚪 Logout
      </button>

      {/* Tabs */}
      <div className="tabs">
        {["summarize", "quiz", "keywords", "flashcards", "upload"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => {
              setActiveTab(tab);
              setResult("");
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Options */}
      <div style={{ marginBottom: "10px" }}>
        {activeTab === "summarize" && (
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="short">Short Summary</option>
            <option value="detailed">Detailed Summary</option>
          </select>
        )}
        {activeTab === "quiz" && (
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        )}
      </div>

      {/* Text Input */}
      {activeTab !== "upload" && (
        <div className="text-section">
          <textarea
            placeholder={`✍️ Enter your plain text here to ${activeTab}...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
          <button onClick={() => callAPI(activeTab)}>Run {activeTab}</button>
        </div>
      )}

      {/* File Upload */}
      {activeTab === "upload" && (
        <div className="upload-section">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: "10px" }}
          />
          <button onClick={() => callAPI("process-pdf", true)}>📄 Process PDF</button>
          <button onClick={() => callAPI("process-docx", true)}>📑 Process DOCX</button>
          <button onClick={() => callAPI("process-txt", true)}>📝 Process TXT</button>
          <button onClick={() => callAPI("process-pptx", true)}>📊 Process PPTX</button>
        </div>
      )}

      <div className="results">
        <h2>Results:</h2>
        {renderResults()}
      </div>
    </div>
  );
}

export default App;
