# 🎓 SmartLearn Frontend — Adaptive Quiz & Summarizer Agent

**SmartLearn** is an AI-powered learning assistant that helps students and educators **summarize documents, generate quizzes, extract keywords, and create flashcards** — all through a modern, interactive web interface.

It integrates **Google Gemini 2.5 Pro** for intelligent text understanding and a **fine-tuned T5 summarizer** as fallback, ensuring reliable, adaptive results.

---

## 🌐 Live Demo
 
🧠 **Backend Repo:** [https://github.com/kavyak1604/SmartLearn](#)  
💻 **Frontend Repo:** [https://github.com/kavyak1604/SmartLearn-Frontend](#)

---

## 🧠 Problem Statement

Students spend excessive time summarizing study materials and creating quizzes manually.  
SmartLearn automates this process by enabling users to upload notes or paste text and instantly receive:

- 📘 Concise summaries  
- 🧩 Interactive multiple-choice quizzes  
- 🔍 Key concept extractions  
- 💡 Flip flashcards for quick revisions  

---

## 🚀 Solution Overview

SmartLearn delivers an adaptive and user-centric learning experience through:
- **FastAPI + React architecture** for seamless backend–frontend integration  
- **Gemini 2.5 Pro** for intelligent summarization, quiz, and keyword generation  
- **Fine-tuned T5 model** for offline fallback (trained on Samsum dataset)  
- **Gamma-inspired UI** — glassmorphism, gradients, and motion effects  

---

## 🏗️ Architecture

![Architecture Diagram](../assets/architecture.png)

### 🔹 Workflow Summary
1. User logs in or registers (JWT-based authentication).  
2. Enters or uploads content → selects task (Summarize, Quiz, Keywords, Flashcards, or Process Files).  
3. **Frontend (React + Axios)** sends the request to **FastAPI** backend via REST.  
4. **Backend** processes it with Gemini 2.5 Pro or fine-tuned **T5** model.  
5. The processed JSON response returns and is rendered as **interactive UI elements** (gift-box quizzes, flip flashcards, etc.).

---

## ⚙️ Tech Stack

| Layer | Tools / Libraries | Purpose |
|-------|--------------------|----------|
| **Frontend** | React (Vite) | Component-based UI |
|  | TailwindCSS | Styling & responsive design |
|  | Framer Motion | Smooth animations |
|  | Lucide React | Icons |
| **Backend** | FastAPI | REST APIs |
|  | Uvicorn | ASGI server |
| **AI Models** | Gemini 2.5 Pro | Main summarization and quiz generation |
|  | Fine-tuned T5 | Fallback summarizer |
| **Parsing** | PyMuPDF, python-docx, python-pptx | File extraction |
| **Auth** | python-jose | JWT-based authentication |
| **Env Management** | python-dotenv | Load environment variables |

---

## 💡 Core Features

- 🧠 **Summarization** — Short / Detailed text summarization  
- 🧩 **Quiz Generation** — 5-option MCQs with gift-box reveal  
- 🔍 **Keyword Extraction** — Key terms for easy review  
- 💡 **Flashcards** — Interactive keyword ↔ definition cards  
- 📄 **Multi-format File Support** — PDF, DOCX, PPTX, TXT  
- 🔐 **JWT Auth System** — Login & registration  
- 🎨 **Gamma Glow Design** — Modern glassy visuals & smooth animations  

---

## 🧰 Setup & Run (Frontend)

### Prerequisites
- Node.js ≥ 18  
- Backend server running locally at `http://127.0.0.1:8000`

### 1️⃣ Clone & Navigate
```bash
git clone https://github.com/kavyak1604/Adaptive_Agent-Frontend.git
cd Adaptive_Agent-Frontend
