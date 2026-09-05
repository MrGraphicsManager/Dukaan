import React, { useState, useEffect, useMemo } from "react";
import { 
  Music, 
  Headphones, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  X, 
  ExternalLink, 
  Sparkles, 
  Radio, 
  Check, 
  ListMusic,
  Info,
  Search,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// 100% FULL-LENGTH Presets (No 30-second cuts, continuous full tracks!)
const FULL_PRESET_PLAYLISTS = [
  {
    name: "🎧 24/7 Lofi Chill Beats",
    type: "youtube",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    desc: "100% Full continuous lofi stream (0 cuts)"
  },
  {
    name: "🎵 Bollywood Hindi Hits (Full)",
    type: "youtube",
    url: "https://www.youtube.com/watch?v=kY3SuK2t3_U",
    desc: "Acoustic Hindi favorites non-stop full songs"
  },
  {
    name: "⚡ Deep Focus & Tech Lounge",
    type: "youtube",
    url: "https://www.youtube.com/watch?v=WPni755-Krg",
    desc: "3-Hour uninterrupted ambient work beats"
  },
  {
    name: "☕ Punjabi & Indie Pop Vibes",
    type: "youtube",
    url: "https://www.youtube.com/watch?v=mU_Yv_h8x4c",
    desc: "Full continuous Punjabi & indie tracks"
  }
];

export function parseMusicUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();

  // 1. SPOTIFY
  if (trimmed.includes("spotify.com")) {
    if (trimmed.includes("/embed/")) {
      return {
        type: "spotify",
        embedUrl: trimmed,
        rawUrl: trimmed,
        title: "Spotify Player",
        isSpotify: true
      };
    }
    const match = trimmed.match(/open\.spotify\.com\/(playlist|track|album|artist|episode)\/([a-zA-Z0-9]+)/);
    if (match) {
      const kind = match[1];
      const id = match[2];
      return {
        type: "spotify",
        kind,
        id,
        embedUrl: `https://open.spotify.com/embed/${kind}/${id}?utm_source=generator&theme=0`,
        rawUrl: trimmed,
        title: `Spotify ${kind.charAt(0).toUpperCase() + kind.slice(1)}`,
        isSpotify: true
      };
    }
    const converted = trimmed.replace("open.spotify.com/", "open.spotify.com/embed/");
    return {
      type: "spotify",
      embedUrl: converted,
      rawUrl: trimmed,
      title: "Spotify Music",
      isSpotify: true
    };
  }

  // 2. YOUTUBE
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    // Playlist
    if (trimmed.includes("list=")) {
      const match = trimmed.match(/list=([a-zA-Z0-9_-]+)/);
      if (match) {
        const listId = match[1];
        return {
          type: "youtube",
          kind: "playlist",
          id: listId,
          embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}&autoplay=1`,
          rawUrl: trimmed,
          title: "YouTube Full Playlist (No 30s Limit)",
          isFullLength: true
        };
      }
    }

    // Video ID
    let videoId = "";
    if (trimmed.includes("youtu.be/")) {
      videoId = trimmed.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
    } else if (trimmed.includes("v=")) {
      videoId = trimmed.split("v=")[1]?.split("&")[0];
    } else if (trimmed.includes("embed/")) {
      videoId = trimmed.split("embed/")[1]?.split("?")[0];
    }

    if (videoId) {
      return {
        type: "youtube",
        kind: "video",
        id: videoId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
        rawUrl: trimmed,
        title: "YouTube Full Song (No 30s Limit)",
        isFullLength: true
      };
    }
  }

  // 3. TEXT SEARCH QUERY (e.g. user typed "Arijit Singh songs" or "Lofi hindi")
  if (trimmed.length > 2 && !trimmed.startsWith("http")) {
    const query = encodeURIComponent(trimmed);
    return {
      type: "youtube",
      kind: "search",
      embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${query}&autoplay=1`,
      rawUrl: trimmed,
      title: `YouTube Search: "${trimmed}" (Full Audio)`,
      isFullLength: true
    };
  }

  return null;
}

export default function AdminMusicPlayer() {
  const [activeUrl, setActiveUrl] = useState(() => {
    return localStorage.getItem("dukaan_admin_music_url") || FULL_PRESET_PLAYLISTS[0].url;
  });
  const [inputUrl, setInputUrl] = useState("");
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem("dukaan_admin_music_expanded");
    return stored === null ? true : stored === "true";
  });

  const parsedMedia = useMemo(() => {
    return parseMusicUrl(activeUrl);
  }, [activeUrl]);

  useEffect(() => {
    if (activeUrl) {
      localStorage.setItem("dukaan_admin_music_url", activeUrl);
    }
  }, [activeUrl]);

  useEffect(() => {
    localStorage.setItem("dukaan_admin_music_expanded", String(isExpanded));
  }, [isExpanded]);

  const handleApplyUrl = (e) => {
    if (e) e.preventDefault();
    const clean = inputUrl.trim();
    if (!clean) {
      toast.error("Please enter a YouTube link, Spotify link, or song name.");
      return;
    }
    const parsed = parseMusicUrl(clean);
    if (!parsed) {
      toast.error("Could not parse song. Try a YouTube video/playlist link or search term.");
      return;
    }
    setActiveUrl(clean);
    setInputUrl("");
    if (parsed.type === "spotify") {
      toast.info("Loaded Spotify. Note: Spotify limits free/unlogged embeds to 30s. Use YouTube links for full songs!");
    } else {
      toast.success("Playing full-length audio via YouTube!");
    }
  };

  const handleSelectPreset = (preset) => {
    setActiveUrl(preset.url);
    toast.success(`Playing full song preset: ${preset.name}`);
  };

  const handleSwitchToYouTubeFull = () => {
    // If currently on spotify, switch to full YouTube Bollywood or Lofi
    setActiveUrl("https://www.youtube.com/watch?v=kY3SuK2t3_U");
    toast.success("Switched to YouTube Full Songs (0 limits, 100% full audio)!");
  };

  const handleClear = () => {
    setActiveUrl("");
    localStorage.removeItem("dukaan_admin_music_url");
    toast.info("Music player cleared.");
  };

  return (
    <div className="w-full bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 border-b border-indigo-900/50 text-slate-200 transition-all z-30 shadow-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5">
        
        {/* COMPACT TOP BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Player Status & Equalizer */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
              <Headphones className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Sound Lounge</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Full Audio
                </span>
              </span>

              {parsedMedia ? (
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    parsedMedia.type === "spotify" 
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" 
                      : "bg-rose-950 text-rose-400 border border-rose-800/60"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      parsedMedia.type === "spotify" ? "bg-emerald-400 animate-pulse" : "bg-rose-400 animate-pulse"
                    }`} />
                    {parsedMedia.type === "spotify" ? "Spotify (30s Preview)" : "YouTube (Full Song)"}
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium max-w-[180px] sm:max-w-[300px] truncate">
                    {parsedMedia.title}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 italic">No playlist loaded</span>
              )}
            </div>

            {/* Live animated Equalizer Soundwaves */}
            {parsedMedia && (
              <div className="hidden sm:flex items-end gap-0.5 h-3 ml-2">
                <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_100ms] h-2.5" />
                <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_300ms] h-3.5" />
                <span className="w-1 bg-sky-400 rounded-full animate-[bounce_1s_infinite_200ms] h-2" />
                <span className="w-1 bg-purple-400 rounded-full animate-[bounce_1s_infinite_400ms] h-3" />
              </div>
            )}
          </div>

          {/* Right: Controls & Expand/Collapse */}
          <div className="flex items-center gap-2">
            
            {/* Quick Full-Length Presets Pills (Desktop) */}
            <div className="hidden xl:flex items-center gap-1.5">
              {FULL_PRESET_PLAYLISTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                    activeUrl === p.url 
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm" 
                      : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                  }`}
                  title={p.desc}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Toggle Drawer Button */}
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              size="sm"
              className="h-7 px-2.5 rounded-lg border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
            >
              <ListMusic className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isExpanded ? "Hide Player" : "Open Player"}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>

            {/* Clear / Close */}
            {parsedMedia && (
              <button
                onClick={handleClear}
                className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 flex items-center justify-center transition-colors"
                title="Eject music player"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* EXPANDED INTERACTIVE PLAYER & INPUT DRAWER */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start animate-fade-in">
            
            {/* Left Column: Embed Iframe Player */}
            <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-2.5 border border-slate-800 shadow-2xl overflow-hidden space-y-2">
              
              {/* Spotify Preview Notice Bar */}
              {parsedMedia?.isSpotify && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Spotify iframe me browser login na hone par 30-sec preview chalta hai.</span>
                  </div>
                  <Button
                    onClick={handleSwitchToYouTubeFull}
                    size="sm"
                    className="h-7 px-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg shrink-0"
                  >
                    ▶️ Play Full Audio on YouTube
                  </Button>
                </div>
              )}

              {parsedMedia ? (
                parsedMedia.type === "spotify" ? (
                  <iframe
                    src={parsedMedia.embedUrl}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Spotify Embed"
                    className="rounded-xl w-full bg-slate-950"
                  />
                ) : (
                  <div className="relative w-full rounded-xl overflow-hidden aspect-video max-h-[220px] bg-black">
                    <iframe
                      src={parsedMedia.embedUrl}
                      width="100%"
                      height="100%"
                      title="YouTube Full Embed"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                )
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-center p-4 text-slate-500">
                  <Radio className="w-8 h-8 mb-2 text-slate-600 animate-pulse" />
                  <p className="text-xs">No song loaded. Paste any YouTube video/playlist link or search any song title on the right.</p>
                </div>
              )}
            </div>

            {/* Right Column: Custom Link Input & Presets */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <form onSubmit={handleApplyUrl} className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Enter Song Name or YouTube / Spotify Link</span>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">100% Full Audio</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g. YouTube link, Spotify link, or 'Arijit Singh songs'"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs h-9 rounded-xl focus:border-indigo-500"
                  />
                  <Button
                    type="submit"
                    className="h-9 px-3.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shrink-0 active:scale-95 transition-all shadow-md"
                  >
                    Play Full
                  </Button>
                </div>
              </form>

              {/* Quick Presets Grid (All 100% Full Tracks) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Full-Length Executive Mixes (0 Limits)
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold font-mono">No 30s Cuts</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {FULL_PRESET_PLAYLISTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(p)}
                      className={`text-left p-2 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                        activeUrl === p.url
                          ? "bg-indigo-950/70 border-indigo-500 text-white shadow-sm"
                          : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      <div className="font-semibold truncate flex items-center justify-between">
                        <span>{p.name}</span>
                        {activeUrl === p.url && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate mt-0.5">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanation Note */}
              <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                <strong className="text-white">Full Song Tip:</strong> Spotify embeds bina Spotify login ke sirf 30-sec preview dete hain. YouTube par poore 100% songs & playlists chalte hain. Aap direct YouTube song link paste karein ya upar kisi bhi gaane ka naam likhkar <strong>"Play Full"</strong> dabayein!
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
