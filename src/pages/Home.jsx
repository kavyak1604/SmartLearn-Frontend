import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Brain, FileText, Layers, Zap } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white relative overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-700/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse"></div>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center py-32 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl sm:text-7xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent"
        >
          SmartLearn an AI-Powered Learning Companion
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-6 text-lg text-gray-300 max-w-2xl"
        >
          Learn faster, summarize smarter — powered by Gemini & T5.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 flex gap-4"
        >
          <button
            onClick={() => navigate("/app")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:scale-105 transition-transform"
          >
            Get Started
          </button>
          <button className="px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-800 transition">
            Learn More
          </button>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-6 max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: <Brain className="w-10 h-10 text-purple-400 mb-4" />, title: "Summarization", desc: "Turn long docs into key insights in seconds." },
          { icon: <FileText className="w-10 h-10 text-pink-400 mb-4" />, title: "Quiz Generator", desc: "Instantly create personalized quizzes." },
          { icon: <Layers className="w-10 h-10 text-indigo-400 mb-4" />, title: "Keywords", desc: "Extract main concepts automatically." },
          { icon: <Zap className="w-10 h-10 text-yellow-400 mb-4" />, title: "Flashcards", desc: "Interactive learning cards, powered by AI." },
        ].map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl backdrop-blur-md shadow-lg"
          >
            {f.icon}
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-10 text-gray-500 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} Adaptive Agent · Built with 💜 React + Tailwind
      </footer>
    </div>
  );
}
