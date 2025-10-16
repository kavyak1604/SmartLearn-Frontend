import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import API from "../api";

/* -------------------------------------------
   Helpers
--------------------------------------------*/

// Parse flashcards returned as text into [{ term, definition }]
function parseFlashcards(raw = "") {
  if (!raw || typeof raw !== "string") return [];

  // Normalize and clean up any formatting
  const text = raw
    .replace(/\r\n/g, "\n")
    .replace(/```[\s\S]*?```/g, "")
    .trim();

  const cards = [];
  const blocks = text.split(/Keyword\s*:/i).slice(1); // skip first split if empty

  for (const block of blocks) {
    const [termPart, defPart] = block.split(/Definition\s*:/i);
    const term = termPart?.split("\n")[0]?.trim().replace(/^[-•\s]+/, "");
    const definition = defPart
      ?.replace(/^[-•\s]+/, "")
      ?.trim()
      ?.split(/Keyword\s*:/i)[0]
      ?.trim();

    if (term && definition) {
      cards.push({ term, definition });
    }
  }

  // If Gemini changes format (no 'Keyword' markers), fallback to line pairs
  if (cards.length === 0) {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    for (let i = 0; i < lines.length - 1; i += 2) {
      const term = lines[i];
      const definition = lines[i + 1];
      if (term && definition) cards.push({ term, definition });
    }
  }

  return cards.slice(0, 24);
}




/* -------------------------------------------
   Quiz GiftBox (Instagram-like reveal)
--------------------------------------------*/
function GiftBox({ answer }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="flex justify-center mt-2">
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="relative w-14 h-14 rounded-md bg-gradient-to-br from-purple-600 to-pink-500 text-2xl shadow-lg hover:shadow-[0_0_30px_rgba(236,72,153,0.65)] transition grid place-items-center"
          title="Tap to reveal"
        >
          🎁
        </button>
      ) : (
        <div className="bg-green-100/90 border border-green-300/60 p-3 rounded-lg w-full text-center text-green-900 font-semibold shadow-inner transition-all duration-500">
          ✅ {answer}
        </div>
      )}
    </div>
  );
}

function GlowFlashcard({ term, definition }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative w-[16rem] h-64 cursor-pointer rounded-2xl transition-transform duration-700 hover:scale-[1.03]"
      onClick={() => setFlipped((f) => !f)}
      style={{ perspective: "1200px" }}
    >
      <div
        className="absolute inset-0 rounded-3xl shadow-[0_0_35px_rgba(236,72,153,0.45)]"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.8s ease-in-out",
        }}
      >
        {/* Front — Keyword */}
        <div
          className="absolute inset-0 flex items-center justify-center text-center p-6 rounded-3xl font-bold text-xl text-white bg-gradient-to-br from-purple-600 to-pink-500 backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            boxShadow: "inset 0 0 20px rgba(255,255,255,0.1)",
          }}
        >
          {term || "Keyword"}
        </div>

        {/* Back — Definition */}
        <div
          className="absolute inset-0 flex items-center justify-center text-center p-6 rounded-3xl text-base font-medium text-gray-100 bg-gradient-to-br from-pink-600 to-purple-500"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            lineHeight: "1.6",
          }}
        >
          {definition || "Definition not found"}
        </div>
      </div>
    </div>
  );
}


/* -------------------------------------------
   Dashboard (Gamma glow, subtle background)
--------------------------------------------*/
export default function Dashboard() {
  // ---------- AUTH ----------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // ---------- UI State ----------
  const [activeTab, setActiveTab] = useState("summarize");

  // Inputs (isolated per tab)
  const [summaryText, setSummaryText] = useState("");
  const [quizText, setQuizText] = useState("");
  const [keywordText, setKeywordText] = useState("");
  const [flashcardText, setFlashcardText] = useState("");
  const [summaryMode, setSummaryMode] = useState("short");
  const [difficulty, setDifficulty] = useState("medium");

  // File processing
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("pdf"); // pdf | docx | txt | pptx

  // Results (isolated)
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState("");
  const [keywords, setKeywords] = useState("");
  const [flashcardsRaw, setFlashcardsRaw] = useState("");
  const flashcards = parseFlashcards(flashcardsRaw);

  // Process tab results (separate)
  const [processResult, setProcessResult] = useState({
    summary: "",
    quiz: "",
    keywords: "",
    flashcards: "",
  });
  const processFlashcards = parseFlashcards(processResult.flashcards);

  // Loading flags
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);

  useEffect(() => {
    API.get("/").catch(() => {});
  }, []);

  // ---------- AUTH ----------
  async function register() {
    try {
      await API.post("/register", { username, password, full_name: username });
      alert("✅ Registered successfully!");
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.detail || "Unknown"));
    }
  }
  async function login() {
    try {
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);
      const res = await API.post("/token", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      localStorage.setItem("token", res.data.access_token);
      setToken(res.data.access_token);
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.detail || "Unknown"));
    }
  }
  function logout() {
    localStorage.removeItem("token");
    setToken("");
  }

  // ---------- Core Calls ----------
  async function summarize() {
    if (!summaryText.trim()) return alert("Please paste some text.");
    setSummaryLoading(true);
    try {
      const res = await API.post("/summarize", {
        text: summaryText,
        mode: summaryMode,
      });
      setSummary(res.data.summary || "");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function generateQuiz() {
    if (!quizText.trim()) return alert("Please paste some text.");
    setQuizLoading(true);
    try {
      const res = await API.post("/quiz", { text: quizText, difficulty });
      setQuiz(res.data.quiz || "");
    } finally {
      setQuizLoading(false);
    }
  }

  async function extractKeywords() {
    if (!keywordText.trim()) return alert("Please paste some text.");
    setKeywordLoading(true);
    try {
      const res = await API.post("/keywords", { text: keywordText });
      setKeywords(res.data.keywords || "");
    } finally {
      setKeywordLoading(false);
    }
  }

  async function generateFlashcards() {
    if (!flashcardText.trim()) return alert("Please paste some text.");
    setFlashcardLoading(true);
    try {
      const res = await API.post("/flashcards", { text: flashcardText });
      setFlashcardsRaw(res.data.flashcards || "");
    } finally {
      setFlashcardLoading(false);
    }
  }

 async function processFile() {
  if (!file) return alert("Please upload a file first!");
  setProcessLoading(true);
  setProcessStatus("🧠 Starting file analysis...");
  setProcessResult({ summary: "", quiz: "", keywords: "", flashcards: "" });

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Step 1️⃣ — Summarize
    setProcessStatus("🧠 Generating summary...");
    const summaryRes = await API.post(`/summarize-${fileType}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setProcessResult((prev) => ({ ...prev, summary: summaryRes.data.summary || "" }));

    // Step 2️⃣ — Quiz
    setProcessStatus("🧩 Creating quiz...");
    const quizRes = await API.post("/quiz", { text: summaryRes.data.summary });
    setProcessResult((prev) => ({ ...prev, quiz: quizRes.data.quiz || "" }));

    // Step 3️⃣ — Keywords
    setProcessStatus("🔍 Extracting keywords...");
    const keywordRes = await API.post("/keywords", { text: summaryRes.data.summary });
    setProcessResult((prev) => ({ ...prev, keywords: keywordRes.data.keywords || "" }));

    // Step 4️⃣ — Flashcards
    setProcessStatus("💡 Generating flashcards...");
    const flashRes = await API.post("/flashcards", { text: summaryRes.data.summary });
    setProcessResult((prev) => ({ ...prev, flashcards: flashRes.data.flashcards || "" }));

    setProcessStatus("✅ Done!");
  } catch (err) {
    console.error(err);
    setProcessStatus("❌ Something went wrong.");
  } finally {
    setProcessLoading(false);
  }
}
const [processStatus, setProcessStatus] = useState("");


  // ---------- UI ----------
  if (!token)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white"
           style={{
             backgroundColor: "#0a0118",
             backgroundImage:
               "radial-gradient(circle at 10% 20%, rgba(90,0,150,0.18) 0%, transparent 25%), radial-gradient(circle at 80% 60%, rgba(255,0,150,0.12) 0%, transparent 25%)",
           }}>
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                    className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/15 shadow-xl">
          <h1 className="text-4xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Adaptive Agent Login
          </h1>
          <div className="flex flex-col gap-3">
            <input
              className="border border-purple-400/40 bg-white/5 text-white placeholder-gray-300 p-3 rounded focus:ring-2 focus:ring-pink-500"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="border border-purple-400/40 bg-white/5 text-white placeholder-gray-300 p-3 rounded focus:ring-2 focus:ring-pink-500"
              placeholder="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={register}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition shadow-md"
              >
                Register
              </button>
              <button
                onClick={login}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition shadow-md"
              >
                Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen text-gray-100 flex flex-col items-center p-8"
         style={{
           backgroundColor: "#0a0118",
           backgroundImage:
             "radial-gradient(circle at 15% 20%, rgba(90,0,150,0.22) 0%, transparent 30%), radial-gradient(circle at 85% 70%, rgba(255,0,150,0.15) 0%, transparent 28%)",
         }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl flex items-center justify-between mb-8"
      >
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-[0_0_18px_rgba(236,72,153,0.35)]">
          Adaptive Quiz & Summarizer Agent
        </h1>
        <button
          onClick={logout}
          className="bg-gradient-to-r from-red-500 to-pink-600 px-5 py-2 rounded-lg hover:scale-105 transition shadow-lg"
        >
          Logout
        </button>
      </motion.div>

      {/* Tabs (centered) */}
      <div className="w-full max-w-4xl flex justify-center flex-wrap gap-3 mb-8">
        {["summarize", "quiz", "keywords", "flashcards", "files"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-all ${
              activeTab === tab
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                : "bg-white/10 hover:bg-white/20 text-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/15 shadow-2xl"
      >
        {/* Summarize */}
        {activeTab === "summarize" && (
          <>
            <textarea
              className="w-full bg-white/5 border border-pink-400/30 p-4 rounded-lg text-white placeholder-gray-400 mb-4"
              rows="6"
              placeholder="Paste text to summarize..."
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
            />
            <div className="flex items-center gap-3 mb-4">
              <label className="opacity-90">Summary type:</label>
              <select
                value={summaryMode}
                onChange={(e) => setSummaryMode(e.target.value)}
                className="bg-white/10 border border-pink-400/40 text-white rounded p-2"
              >
                <option value="short">Short</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
            <button
              onClick={summarize}
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-lg shadow-md hover:scale-105 transition"
            >
              Generate Summary
            </button>
            {summaryLoading && <p className="mt-4 text-pink-300 animate-pulse">✨ Generating summary...</p>}
            {summary && (
              <div className="mt-6 bg-white/10 p-4 rounded-lg border border-white/20 text-white">
                <h3 className="font-bold mb-2 capitalize">{summaryMode} summary</h3>
                <p>{summary}</p>
              </div>
            )}
          </>
        )}

        {/* Quiz */}
        {activeTab === "quiz" && (
          <>
            <textarea
              className="w-full bg-white/5 border border-pink-400/30 p-4 rounded-lg text-white placeholder-gray-400 mb-4"
              rows="6"
              placeholder="Paste text to generate a quiz..."
              value={quizText}
              onChange={(e) => setQuizText(e.target.value)}
            />
            <div className="flex items-center gap-3 mb-4">
              <label className="opacity-90">Difficulty:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-white/10 border border-pink-400/40 text-white rounded p-2"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button
              onClick={generateQuiz}
              className="bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-2 rounded-lg shadow-md hover:scale-105 transition"
            >
              Generate Quiz
            </button>
            {quizLoading && <p className="mt-4 text-green-300 animate-pulse">🎯 Generating quiz...</p>}
            {quiz && (
              <div className="mt-6 space-y-4">
                {quiz
                  .split(/Q\d+\./)
                  .map((chunk) => chunk.trim())
                  .filter(Boolean)
                  .map((q, idx) => {
                    const [questionPart, ...answerPart] = q.split(/Answer\s*:/i);
                    const questionText = questionPart.split("\n")[0]?.trim() || `Question ${idx + 1}`;
                    const options = questionPart
                      .split("\n")
                      .slice(1)
                      .filter((line) => /^[a-d]\)/i.test(line.trim()));
                    const answer = (answerPart.join(":") || "").trim();

                    return (
                      <div key={idx} className="bg-white/10 p-4 rounded-xl border border-white/15">
                        <p className="font-semibold mb-2">{`Q${idx + 1}. ${questionText}`}</p>
                        <ul className="space-y-1 mb-3 text-white/90">
                          {options.map((opt, i) => (
                            <li key={i}>{opt}</li>
                          ))}
                        </ul>
                        <GiftBox answer={answer} />
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}

        {/* Keywords */}
        {activeTab === "keywords" && (
          <>
            <textarea
              className="w-full bg-white/5 border border-pink-400/30 p-4 rounded-lg text-white placeholder-gray-400 mb-4"
              rows="6"
              placeholder="Paste text to extract keywords..."
              value={keywordText}
              onChange={(e) => setKeywordText(e.target.value)}
            />
            <button
              onClick={extractKeywords}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-2 rounded-lg shadow-md hover:scale-105 transition"
            >
              Extract Keywords
            </button>
            {keywordLoading && <p className="mt-4 text-yellow-300 animate-pulse">🔍 Extracting keywords...</p>}
            {keywords && (
              <div className="mt-6 bg-white/10 p-4 rounded-lg border border-white/20 text-white whitespace-pre-wrap">
                {keywords}
              </div>
            )}
          </>
        )}

    {/* 💡 Flashcards */}
{activeTab === "flashcards" && (
  <>
    <textarea
      className="w-full bg-white/5 border border-pink-400/30 p-4 rounded-lg text-white placeholder-gray-400 mb-4"
      rows="6"
      placeholder="Paste text to generate flashcards..."
      value={flashcardText}
      onChange={(e) => setFlashcardText(e.target.value)}
    />
    <button
      onClick={generateFlashcards}
      className="bg-gradient-to-r from-pink-500 to-red-500 px-6 py-2 rounded-lg shadow-md hover:scale-105 transition"
    >
      Generate Flashcards
    </button>

    {flashcardLoading && (
      <p className="mt-4 text-pink-300 animate-pulse">
        💡 Generating flashcards...
      </p>
    )}

    {flashcards.length > 0 && (
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center place-items-center">
        {flashcards.map((c, i) => (
          <GlowFlashcard key={i} term={c.term} definition={c.definition} />
        ))}
      </div>
    )}
  </>
)}


 

        {/* Files / Process */}
        {activeTab === "files" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <label className="opacity-90">File type:</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="bg-white/10 border border-pink-400/40 text-white rounded p-2"
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="txt">TXT</option>
                  <option value="pptx">PPTX</option>
                </select>
              </div>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="text-sm text-gray-300"
                accept=".pdf,.docx,.txt,.pptx"
              />
            </div>
            <button
              onClick={processFile}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2 rounded-lg shadow-md hover:scale-105 transition"
            >
              Process File
            </button>
            {processLoading && <p className="mt-4 text-indigo-300 animate-pulse">📄 Processing file...</p>}

            {!processLoading && processResult.summary && (
              <div className="mt-6 space-y-6">
                {/* Summary */}
                <div className="bg-white/10 p-4 rounded-lg border border-white/20 text-white">
                  <h3 className="text-lg font-semibold text-pink-300 mb-2">🧠 Summary</h3>
                  <p>{processResult.summary}</p>
                </div>

                {/* Quiz with GiftBox reveal */}
                {processResult.quiz && (
                  <div className="bg-white/10 p-4 rounded-lg border border-white/20 text-white">
                    <h3 className="text-lg font-semibold text-green-300 mb-3">🧩 Quiz</h3>
                    {processResult.quiz
                      .split(/Q\d+\./)
                      .map((chunk) => chunk.trim())
                      .filter(Boolean)
                      .map((q, idx) => {
                        const [questionPart, ...answerPart] = q.split(/Answer\s*:/i);
                        const questionText = questionPart.split("\n")[0]?.trim() || `Question ${idx + 1}`;
                        const options = questionPart
                          .split("\n")
                          .slice(1)
                          .filter((line) => /^[a-d]\)/i.test(line.trim()));
                        const answer = (answerPart.join(":") || "").trim();

                        return (
                          <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 mb-3">
                            <p className="font-semibold mb-2">{`Q${idx + 1}. ${questionText}`}</p>
                            <ul className="space-y-1 mb-3 text-white/90">
                              {options.map((opt, i) => (
                                <li key={i}>{opt}</li>
                              ))}
                            </ul>
                            <GiftBox answer={answer} />
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Keywords */}
                {processResult.keywords && (
                  <div className="bg-white/10 p-4 rounded-lg border border-white/20 text-white">
                    <h3 className="text-lg font-semibold text-yellow-300 mb-2">🔍 Keywords</h3>
                    <pre className="whitespace-pre-wrap">{processResult.keywords}</pre>
                  </div>
                )}

                {/* Flashcards (glow) */}
            {processFlashcards.length > 0 && (
    <div className="bg-white/10 p-4 rounded-lg border border-white/20 text-white">
    <h3 className="text-lg font-semibold text-blue-300 mb-3">💡 Flashcards</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {processFlashcards.map((c, i) => (
        <GlowFlashcard key={i} term={c.term} definition={c.definition} />
      ))}
    </div>
  </div>
)}

              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
