import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, Check, Plus, Trash2, X, AlertCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const NUMBER_MAP = {
  "ek": 1, "one": 1, "1": 1,
  "do": 2, "two": 2, "2": 2,
  "teen": 3, "three": 3, "3": 3,
  "char": 4, "chaar": 4, "four": 4, "4": 4,
  "paanch": 5, "panch": 5, "five": 5, "5": 5,
  "chhe": 6, "chhah": 6, "six": 6, "6": 6,
  "saat": 7, "seven": 7, "7": 7,
  "aath": 8, "eight": 8, "8": 8,
  "nau": 9, "nine": 9, "9": 9,
  "das": 10, "ten": 10, "10": 10,
  "aadha": 0.5, "half": 0.5
};

export default function VoiceBillingModal({ isOpen, onClose, products = [], onAddItems }) {
  const { playAudioChime } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [selectedLang, setSelectedLang] = useState("hi-IN"); // hi-IN, en-IN, gu-IN
  const [detectedItems, setDetectedItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript("");
      setInterimText("");
      setDetectedItems([]);
      setErrorMsg("");
      return;
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    setErrorMsg("");
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        playAudioChime("beep");
      };

      recognition.onresult = (event) => {
        let currentInterim = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + " ";
          } else {
            currentInterim += res[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        }

        if (finalTranscript) {
          setTranscript((prev) => {
            const updated = (prev + " " + finalTranscript).trim();
            parseSpeechToItems(updated);
            return updated;
          });
          setInterimText("");
        }
      };

      recognition.onerror = (e) => {
        if (e.error !== "no-speech") {
          setErrorMsg(`Voice input notice: ${e.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setErrorMsg("Failed to access microphone. Please check browser permissions.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Smart Parser for grocery items & quantities
  const parseSpeechToItems = (text) => {
    if (!text || !products || products.length === 0) return;
    const lower = text.toLowerCase();
    
    // Split sentences or comma/aur separated phrases
    const phrases = lower
      .split(/(?:,|\baur\b|\band\b|\bplus\b|\btatha\b)/i)
      .map((p) => p.trim())
      .filter(Boolean);

    const matches = [];

    phrases.forEach((phrase) => {
      // Find quantity
      const words = phrase.split(/\s+/);
      let qty = 1;
      let cleanedPhrase = phrase;

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (NUMBER_MAP[word]) {
          qty = NUMBER_MAP[word];
          cleanedPhrase = words.filter((_, idx) => idx !== i).join(" ");
          break;
        } else if (!isNaN(Number(word)) && Number(word) > 0) {
          qty = Number(word);
          cleanedPhrase = words.filter((_, idx) => idx !== i).join(" ");
          break;
        }
      }

      // Strip units (kilo, kg, gm, packet, packet, bottle, nos)
      cleanedPhrase = cleanedPhrase
        .replace(/\b(kilo|kg|packet|pkt|bottle|box|gm|gram|piece|pc|pcs|biscuit|bar)\b/gi, "")
        .trim();

      if (!cleanedPhrase) return;

      // Find best match in catalog
      let bestMatch = null;
      let highestScore = 0;

      for (const prod of products) {
        const prodName = (prod.name || "").toLowerCase();
        // Exact substring
        if (prodName.includes(cleanedPhrase) || cleanedPhrase.includes(prodName)) {
          bestMatch = prod;
          highestScore = 1;
          break;
        }

        // Token overlap
        const prodWords = prodName.split(/\s+/);
        const queryWords = cleanedPhrase.split(/\s+/);
        let matchCount = 0;

        queryWords.forEach((qw) => {
          if (qw.length > 2 && prodWords.some((pw) => pw.includes(qw) || qw.includes(pw))) {
            matchCount++;
          }
        });

        const score = matchCount / Math.max(prodWords.length, queryWords.length);
        if (score > highestScore && score >= 0.3) {
          highestScore = score;
          bestMatch = prod;
        }
      }

      if (bestMatch) {
        const existingIdx = matches.findIndex((m) => m.product.id === bestMatch.id);
        if (existingIdx > -1) {
          matches[existingIdx].qty += qty;
        } else {
          matches.push({
            product: bestMatch,
            qty: qty,
            confidence: highestScore
          });
        }
      }
    });

    if (matches.length > 0) {
      setDetectedItems(matches);
      playAudioChime("scan");
    }
  };

  const handleManualAddPhrase = (sample) => {
    setTranscript((prev) => {
      const updated = (prev ? prev + ", " : "") + sample;
      parseSpeechToItems(updated);
      return updated;
    });
  };

  const handleConfirmAll = () => {
    if (detectedItems.length === 0) return;
    onAddItems(detectedItems);
    playAudioChime("success");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Voice-to-Cart Billing</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  Dukaan 3.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speak in Hindi, Hinglish, Gujarati or English to build carts instantly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Controls: Language & Mic */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Language:</span>
              <select
                value={selectedLang}
                onChange={(e) => {
                  setSelectedLang(e.target.value);
                  if (isListening) {
                    stopListening();
                  }
                }}
                className="text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hi-IN">🇮🇳 Hindi (हिंदी)</option>
                <option value="en-IN">🇮🇳 Hinglish / English</option>
                <option value="gu-IN">🇮🇳 Gujarati (ગુજરાતી)</option>
                <option value="mr-IN">🇮🇳 Marathi (मराठी)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" /> Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" /> Tap to Speak
                </>
              )}
            </button>
          </div>

          {/* Wave & Live transcription */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 min-h-[90px] flex flex-col justify-center text-center relative">
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-9 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-7 bg-blue-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
              </div>
            )}

            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {transcript || interimText ? (
                <>
                  <span>{transcript}</span>
                  <span className="text-blue-500 dark:text-blue-400 italic"> {interimText}</span>
                </>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">
                  {isListening
                    ? "Listening... Speak items like '2 kilo Atta, 3 packet Maggi, 1 Dettol Soap'"
                    : "Click 'Tap to Speak' or choose quick samples below"}
                </span>
              )}
            </div>

            {transcript && (
              <button
                onClick={() => {
                  setTranscript("");
                  setDetectedItems([]);
                }}
                className="absolute top-2 right-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                title="Clear transcript"
              >
                Clear
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border border-amber-200/50">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Voice Demo Presets */}
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Quick Voice Test Phrases:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                "2 packet Maggi",
                "1 Fortune Oil, 2 Dettol Soap",
                "Do kilo Atta aur ek Parle-G",
                "3 Amul Butter"
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleManualAddPhrase(sample)}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* Detected Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Recognized Items ({detectedItems.length}):
              </span>
              {detectedItems.length > 0 && (
                <button
                  onClick={() => setDetectedItems([])}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            {detectedItems.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                No items detected yet. Speak items or tap a quick phrase above!
              </div>
            ) : (
              <div className="space-y-2">
                {detectedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">
                          {item.product.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ₹{item.product.selling_price || item.product.price} each · Match: {Math.round(item.confidence * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...detectedItems];
                            if (updated[idx].qty > 1) {
                              updated[idx].qty -= 1;
                              setDetectedItems(updated);
                            } else {
                              setDetectedItems(updated.filter((_, i) => i !== idx));
                            }
                          }}
                          className="px-2 py-0.5 text-xs bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-white">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...detectedItems];
                            updated[idx].qty += 1;
                            setDetectedItems(updated);
                          }}
                          className="px-2 py-0.5 text-xs bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[60px]">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          ₹{((item.product.selling_price || item.product.price) * item.qty).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {detectedItems.length > 0 && (
              <span>
                Total:{" "}
                <strong className="text-slate-900 dark:text-white font-mono text-sm">
                  ₹
                  {detectedItems
                    .reduce(
                      (acc, curr) =>
                        acc + (curr.product.selling_price || curr.product.price) * curr.qty,
                      0
                    )
                    .toFixed(0)}
                </strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              disabled={detectedItems.length === 0}
              onClick={handleConfirmAll}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-md transition shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Add {detectedItems.length} Item(s) to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
