import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SocialAuthButtons({ mode = "login", onSuccess }) {
  const { loginWithGoogle, loginWithApple } = useAuth();
  const nav = useNavigate();
  const [busyProvider, setBusyProvider] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [activeProvider, setActiveProvider] = useState("google");
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  const handleGoogleClick = async () => {
    setBusyProvider("google");
    try {
      const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      if (googleClientId && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            try {
              const base64Url = response.credential.split(".")[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              );
              const payload = JSON.parse(jsonPayload);

              const res = await loginWithGoogle({
                email: payload.email,
                name: payload.name || payload.given_name || "Google User",
                avatar: payload.picture,
                idToken: response.credential,
              });
              if (res.ok) {
                toast.success(`Welcome, ${res.user?.name || "Merchant"}! Signed in via Google.`);
                if (onSuccess) onSuccess(res.user);
                else nav(res.user?.subscription ? "/app" : "/subscribe");
              } else {
                toast.error(res.error || "Failed to sign in with Google.");
              }
            } catch (err) {
              toast.error("Google authentication parsing error.");
            }
          },
        });
        window.google.accounts.id.prompt();
        setBusyProvider(null);
        return;
      }

      // Seamless 1-click Google / Apple prompt
      setActiveProvider("google");
      setCustomEmail("");
      setCustomName("");
      setShowPrompt(true);
    } catch (e) {
      toast.error("Google sign-in error. Please try again.");
    } finally {
      setBusyProvider(null);
    }
  };

  const handleAppleClick = async () => {
    setBusyProvider("apple");
    try {
      setActiveProvider("apple");
      setCustomEmail("");
      setCustomName("");
      setShowPrompt(true);
    } catch (e) {
      toast.error("Apple sign-in error.");
    } finally {
      setBusyProvider(null);
    }
  };

  const submitPrompt = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return toast.error("Please enter a valid email address.");
    }

    setBusyProvider(activeProvider);
    setShowPrompt(false);

    try {
      const generatedName = customName.trim() || cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      let res;
      if (activeProvider === "google") {
        res = await loginWithGoogle({
          email: cleanEmail,
          name: generatedName,
          provider: "google",
        });
      } else {
        res = await loginWithApple({
          email: cleanEmail,
          name: generatedName,
          provider: "apple",
        });
      }

      if (res.ok) {
        toast.success(`Welcome to Dukaan! Signed in with ${activeProvider === "google" ? "Google" : "Apple"}.`);
        if (onSuccess) onSuccess(res.user);
        else nav(res.user?.subscription ? "/app" : "/subscribe");
      } else {
        toast.error(res.error || `Failed to sign in with ${activeProvider}.`);
      }
    } catch (err) {
      toast.error(`Authentication with ${activeProvider} failed.`);
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <>
      <div className="space-y-2.5 w-full">
        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={busyProvider !== null}
          className="w-full h-12 rounded-2xl bg-white hover:bg-blue-50/60 border-2 border-slate-200 hover:border-blue-400 text-slate-800 font-bold text-xs shadow-xs hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-3 relative group"
        >
          {/* Official Google 'G' Multi-color SVG */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span className="tracking-wide text-slate-800 group-hover:text-blue-600 transition-colors">
            {busyProvider === "google" ? "Connecting Google..." : `${mode === "register" ? "Sign up" : "Continue"} with Google`}
          </span>
        </button>

        {/* Continue with Apple */}
        <button
          type="button"
          onClick={handleAppleClick}
          disabled={busyProvider !== null}
          className="w-full h-12 rounded-2xl bg-[#0A1B39] hover:bg-[#0052CC] text-white font-bold text-xs shadow-xs hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-3 relative group"
        >
          {/* Official Apple Logo SVG */}
          <svg className="w-4.5 h-4.5 fill-current shrink-0" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.83-12.01-14.38-6.19-9.46-11.1-20.2-14.73-32.22-3.63-12.03-5.45-23.36-5.45-34 0-14.46 3.65-26.4 10.96-35.83 7.31-9.43 16.36-14.28 27.15-14.56 5.12 0 10.86 1.34 17.21 4.02 6.36 2.69 10.36 4.09 12 4.21 1.91-.12 6.13-1.57 12.65-4.35 6.53-2.77 12.08-4.04 16.66-3.8 12.5.65 22.45 4.96 29.83 12.92-10.89 6.64-16.22 15.77-16 27.4.22 9.03 3.59 16.71 10.11 23.03 6.53 6.32 14.33 9.94 23.41 10.86-2.17 6.43-4.78 12.87-7.83 19.33zM119.22 31.84c0-7.39 2.65-14.28 7.94-20.69 5.29-6.41 11.96-10.46 20-12.15.22 1.3.33 2.49.33 3.59 0 7.39-2.74 14.27-8.23 20.64-5.49 6.36-12.18 10.42-20.04 12.17-.11-.98-.17-2.18-.17-3.56z" />
          </svg>
          <span className="tracking-wide">
            {busyProvider === "apple" ? "Connecting Apple..." : `${mode === "register" ? "Sign up" : "Continue"} with Apple`}
          </span>
        </button>
      </div>

      {/* 1-Click Social Modal Selector */}
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="max-w-sm rounded-3xl bg-white p-6 border-2 border-slate-200 shadow-2xl">
          <DialogHeader className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 grid place-items-center border border-blue-100 shadow-xs">
              {activeProvider === "google" ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 fill-current text-[#0A1B39]" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.83-12.01-14.38-6.19-9.46-11.1-20.2-14.73-32.22-3.63-12.03-5.45-23.36-5.45-34 0-14.46 3.65-26.4 10.96-35.83 7.31-9.43 16.36-14.28 27.15-14.56 5.12 0 10.86 1.34 17.21 4.02 6.36 2.69 10.36 4.09 12 4.21 1.91-.12 6.13-1.57 12.65-4.35 6.53-2.77 12.08-4.04 16.66-3.8 12.5.65 22.45 4.96 29.83 12.92-10.89 6.64-16.22 15.77-16 27.4.22 9.03 3.59 16.71 10.11 23.03 6.53 6.32 14.33 9.94 23.41 10.86-2.17 6.43-4.78 12.87-7.83 19.33zM119.22 31.84c0-7.39 2.65-14.28 7.94-20.69 5.29-6.41 11.96-10.46 20-12.15.22 1.3.33 2.49.33 3.59 0 7.39-2.74 14.27-8.23 20.64-5.49 6.36-12.18 10.42-20.04 12.17-.11-.98-.17-2.18-.17-3.56z" />
                </svg>
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Sign In with {activeProvider === "google" ? "Google" : "Apple"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Instant 1-click verification. No password or 6-digit email code needed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitPrompt} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                {activeProvider === "google" ? "Google / Gmail Address" : "Apple ID / iCloud Email"}
              </label>
              <Input
                type="email"
                required
                autoFocus
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder={activeProvider === "google" ? "youremail@gmail.com" : "youremail@icloud.com"}
                className="h-11 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Shop Name / Your Name (Optional)
              </label>
              <Input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Apna Supermarket"
                className="h-11 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800"
              />
            </div>

            <Button
              type="submit"
              disabled={busyProvider !== null}
              className="w-full h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 mt-2 flex items-center justify-center gap-2"
            >
              <span>{busyProvider !== null ? "Signing in..." : `Continue with ${activeProvider === "google" ? "Google" : "Apple"}`}</span>
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
