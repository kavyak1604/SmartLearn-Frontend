# 🌐 SmartLearn Frontend

This is the **frontend** for the Adaptive Quiz & Summarizer Agent.  
It provides a modern, responsive React interface for users to interact with the backend API: upload documents, summarize content, generate quizzes, extract keywords, and create flashcards.

---

## 🛠️ Tech Stack

- **React** (Vite)
- **JavaScript (ES6+)**
- **CSS** (custom, with Poppins font)
- **Axios** (for API requests)

---

## 📁 Project Structure

```
frontend/
│── src/
│    ├── App.jsx         # Main React component
│    ├── main.jsx        # Entry point
│    ├── App.css         # Main styles
│    └── ...             # Other components & assets
│── public/
│    └── index.html
│── package.json
│── README.md
```

---

## ⚡ Quickstart

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The app will be available at: [http://localhost:5173](http://localhost:5173) (default Vite port)

---

## 🔗 Backend API

- Make sure the backend FastAPI server is running (see backend README).
- By default, the frontend expects the backend at `http://127.0.0.1:8000`.
- If your backend is on a different host/port, update the API URLs in your frontend code.

---

## ✨ Features

- **User Authentication** (register/login)
- **Text Summarization** (short, detailed, bullet)
- **Document Upload** (PDF, DOCX, PPTX, TXT)
- **Quiz Generation** from content
- **Keyword Extraction**
- **Flashcard Creation** (with flip animation)
- **Responsive UI** with tabs and upload sections

---

## 🧪 Example Usage

1. Register or log in.
2. Paste text or upload a document.
3. Choose an action: Summarize, Quiz, Keywords, Flashcards.
4. View results in the results section.

---

## ⚠️ Notes

- For production, build the app with `npm run build`.
- You may need to configure CORS on the backend for cross-origin requests.
- Update API endpoints in the frontend if your backend URL changes.

---

## 📄 License

MIT License © 2025