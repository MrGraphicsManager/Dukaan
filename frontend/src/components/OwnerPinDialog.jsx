import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock, Delete, X } from "lucide-react";
import { verifyOwnerPin } from "@/lib/proStaffPermissions";

export default function OwnerPinDialog({
  isOpen,
  onClose,
  onSuccess,
  shopId = "default",
  title = "Owner Security PIN Required",
  description = "This action is protected. Enter your 4-digit Owner PIN to authorize."
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(false);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (pin.length < 4) {
      toast.error("Please enter a complete 4-digit PIN");
      setError(true);
      return;
    }

    const isValid = verifyOwnerPin(shopId, pin);
    if (isValid) {
      toast.success("Owner authorization granted!");
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(true);
      toast.error("Incorrect Owner PIN! (Default: 1234)");
      setPin("");
    }
  };

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        // Auto-submit when 4th digit entered
        setTimeout(() => {
          if (verifyOwnerPin(shopId, nextPin)) {
            toast.success("Owner authorization granted!");
            if (onSuccess) onSuccess();
            onClose();
          } else {
            setError(true);
            toast.error("Incorrect Owner PIN! (Default: 1234)");
            setPin("");
          }
        }, 150);
      }
    }
  };

  const handleDeleteDigit = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs sm:max-w-sm rounded-3xl p-6 border-2 border-brand-mitti text-brand-indigo font-sans">
        <DialogHeader className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 grid place-items-center mx-auto mb-2 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <DialogTitle className="font-display text-lg font-bold text-brand-indigo">
            {title}
          </DialogTitle>
          <p className="text-xs text-brand-indigo/60">
            {description}
          </p>
        </DialogHeader>

        {/* 4-Digit Display Boxes */}
        <div className="flex justify-center items-center gap-3 my-4">
          {[0, 1, 2, 3].map((idx) => {
            const hasDigit = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-12 h-12 rounded-2xl border-2 grid place-items-center text-xl font-bold font-mono transition-all ${
                  error
                    ? "border-red-500 bg-red-50 text-red-700 animate-shake"
                    : hasDigit
                      ? "border-purple-600 bg-purple-50 text-purple-900 shadow-xs"
                      : "border-brand-mitti/70 bg-slate-50 text-slate-400"
                }`}
              >
                {hasDigit ? "•" : ""}
              </div>
            );
          })}
        </div>

        {/* Hidden Input for Physical Keyboard Typing */}
        <form onSubmit={handleSubmit} className="sr-only">
          <Input
            autoFocus
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </form>

        {/* Touch / Click Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-12 rounded-2xl bg-brand-sand/60 hover:bg-brand-mitti/60 text-brand-indigo font-bold text-lg active:scale-95 transition-all flex items-center justify-center border border-brand-mitti/40"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin("")}
            className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs active:scale-95 transition-all flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress(0)}
            className="h-12 rounded-2xl bg-brand-sand/60 hover:bg-brand-mitti/60 text-brand-indigo font-bold text-lg active:scale-95 transition-all flex items-center justify-center border border-brand-mitti/40"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDeleteDigit}
            className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold active:scale-95 transition-all flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <DialogFooter className="mt-4 flex flex-row items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-10 text-xs text-brand-indigo/60"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={pin.length < 4}
            className="h-10 px-5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authorize</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
