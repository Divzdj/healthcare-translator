import React, { useState, useRef } from "react";

function App() {
  // --- Core State Management ---
  const [inputText, setInputText] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);

  //  ---  Speech-to-Text ---
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  //  ---Speech Synthesis ---
  const [isSpeaking, setIsSpeaking] = useState(false);

  //  --- Translate Function ---
  const handleTranslate = async () => {
    if (!inputText || !targetLang) return;
    setLoading(true);
    setTranslation("");

    try {
      const response = await fetch("http://localhost:5001/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, targetLang }),
      });

      const data = await response.json();
      if (response.ok && data.translation) setTranslation(data.translation);
      else setTranslation("Translation failed. Please try again.");
    } catch (error) {
      console.error(error);
      setTranslation("Error connecting to the server.");
    }
    setLoading(false);
  };

  //  --- Start Recording with Web Speech API ---
  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser. Use Chrome.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  //  --- Stop Recording ---
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  //  --- Speak Translation using Speech Synthesis ---
  const speakTranslation = () => {
    if (!translation) return;
    if (!("speechSynthesis" in window)) {
      alert("Speech Synthesis not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translation);
    utterance.lang =
      targetLang.toLowerCase() === "arabic"
        ? "ar-SA"
        : targetLang.toLowerCase() === "french"
        ? "fr-FR"
        : targetLang.toLowerCase() === "spanish"
        ? "es-ES"
        : targetLang.toLowerCase() === "german"
        ? "de-DE"
        : targetLang.toLowerCase() === "hindi"
        ? "hi-IN"
        : "en-US";

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.cancel(); // stop any ongoing speech
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="app-container">
        <h1 className="app-heading"> Healthcare Translator</h1>


        {/*  Voice-to-Text Controls */}
        <div className="flex justify-center gap-4 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
               Start Speaking
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
            >
               Stop
            </button>
          )}
        </div>

        {/*  Text Input */}
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          rows="4"
          placeholder="Enter or speak text to translate..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {/*  Language Dropdown */}
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

        {/*  Translate Button */}
        <button
          onClick={handleTranslate}
          disabled={loading || !inputText || !targetLang}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition disabled:opacity-50 mb-4"
        >
          {loading ? "Translating..." : "Translate"}
        </button>

        {/*  Speak Translation */}
        {translation && (
          <div className="mt-4 p-4 bg-gray-100 border rounded-lg shadow-inner">
            <h2 className="font-semibold text-gray-700 mb-2">Translation:</h2>
            <p className="text-gray-900 whitespace-pre-line mb-3">{translation}</p>

            <button
              onClick={speakTranslation}
              disabled={isSpeaking}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              {isSpeaking ? " Speaking..." : " Speak Translation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
