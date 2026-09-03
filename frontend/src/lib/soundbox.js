// Dukaan Virtual Soundbox (Browser Audio Synthesis & Chime)
// Speaks: "दुकान: UPI / कैश से ₹X प्राप्त हुए!"

function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Pleasant dual chime (D5 -> A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // AudioContext might require user gesture in some browsers
  }
}

export function playVoiceSoundbox(amount, method = "upi", lang = "hi") {
  try {
    // Play soundbox bell first
    playChime();

    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const cleanAmount = Math.round(Number(amount || 0));
    const modeText = method === "upi" ? "UPI" : method === "cash" ? "Cash" : "Credit";
    const text = `Dukaan: Received ${cleanAmount} rupees via ${modeText}!`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Small delay after chime
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 350);
  } catch (err) {
    console.error("Soundbox voice synthesis error:", err);
  }
}
