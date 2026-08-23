import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";
import { toast } from "sonner";

// Install prompt handler — works on Android Chrome. On iOS shows instructions.
export default function InstallAppButton({ variant = "primary", className = "" }) {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
    const handler = (e) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener("beforeinstallprompt", handler);
    const already = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    setInstalled(already);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (installed) { toast.info("App is already installed"); return; }
    if (isIOS) {
      toast.message("On iPhone: tap Share → Add to Home Screen", { duration: 6000 });
      return;
    }
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") toast.success("Installing…");
      setDeferred(null);
    } else {
      toast.message("Open this site in Chrome and tap the menu → Install App", { duration: 6000 });
    }
  };

  const cls = variant === "primary"
    ? "bg-brand-terracotta text-white hover:bg-brand-terracotta/90 active:scale-95 transition-transform"
    : "border border-brand-mitti bg-white text-brand-indigo hover:bg-brand-mitti active:scale-95 transition-transform";

  return (
    <Button data-testid="install-app-btn" onClick={install} className={`h-12 px-6 ${cls} ${className}`}>
      {isIOS ? <Smartphone className="w-4 h-4 mr-2"/> : <Download className="w-4 h-4 mr-2"/>}
      {installed ? "App installed" : "Get the App"}
    </Button>
  );
}
