import React, { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

function App() {
  // --- Core State ---
  const [inputText, setInputText] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- Speech Recognition Hook ---
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // --- Translation Function ---
  const handleTranslate = async () => {
    console.log("Translate button clicked"); // ✅ Add this line
    if (!inputText || !targetLang) {
      console.log("Missing input or targetLang");
      return;
  }

    setLoading(true);
    setTranslation("");

    console.log("Translating:", { text: textToTranslate, targetLang }); // for debugging

    try {
      const response = await fetch(
        "https://healthcare-translator-server.onrender.com/translate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToTranslate, targetLang }),
        }
      );

      const data = await response.json();
      if (response.ok && data.translation) setTranslation(data.translation);
      else setTranslation("Translation failed. Please try again.");
    } catch (error) {
      console.error("Translation error:", error);
      setTranslation("Error connecting to the server.");
    }
    setLoading(false);
  };

  // --- Speech-to-Text Controls ---
  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  const stopListening = () => SpeechRecognition.stopListening();

  // --- Speak Translation ---
  const speakTranslation = () => {
    if (!translation) return;

    if (!("speechSynthesis" in window)) {
      alert("Speech Synthesis not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translation);

    const langMap = {
      arabic: "ar-SA",
      french: "fr-FR",
      spanish: "es-ES",
      german: "de-DE",
      hindi: "hi-IN",
    };

    utterance.lang = langMap[targetLang.toLowerCase()] || "en-US";

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // --- Check browser support ---
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-4 text-red-600">
        Browser does not support speech recognition. Use Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="app-container w-full max-w-lg">
        <h1 className="app-heading text-2xl font-bold mb-6 text-center">
          Healthcare Translator
        </h1>

        {/* Voice-to-Text Controls */}
        <div className="flex justify-center gap-4 mb-4">
          {!listening ? (
            <button
              onClick={startListening}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Start Speaking
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
            >
              Stop
            </button>
          )}

          <button
            onClick={resetTranscript}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
          >
            Reset
          </button>
        </div>

        {/* Text Input */}
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          rows="4"
          placeholder="Enter or speak text to translate..."
          value={listening ? transcript : inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {/* Language Dropdown */}
        <select
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          <option value="">Select target language</option>
          <option value="French">French</option>
          <option value="Arabic">Arabic</option>
          <option value="Spanish">Spanish</option>
          <option value="German">German</option>
          <option value="Hindi">Hindi</option>
        </select>

        {/* Translate Button */}
        <button
          onClick={handleTranslate}
          disabled={!inputText && !transcript || !targetLang || loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition disabled:opacity-50 mb-4"
        >
          {loading ? "Translating..." : "Translate"}
        </button>

        {/* Speak Translation */}
        {translation && (
          <div className="mt-4 p-4 bg-gray-100 border rounded-lg shadow-inner">
            <h2 className="font-semibold text-gray-700 mb-2">Translation:</h2>
            <p className="text-gray-900 whitespace-pre-line mb-3">{translation}</p>

            <button
              onClick={speakTranslation}
              disabled={isSpeaking}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              {isSpeaking ? "Speaking..." : "Speak Translation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
