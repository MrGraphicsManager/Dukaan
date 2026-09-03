import React from "react";
import { Store, RotateCcw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dukaan UI Error Caught:", error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem("dukaan_remember");
    } catch {}
    window.location.href = "/app";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border-2 border-[#EBE3D5] shadow-xl space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1B1464] text-white grid place-items-center shadow-md">
              <Store className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1B1464]">
                Dukaan Workspace Restored
              </h2>
              <p className="text-xs text-[#1B1464]/70 mt-1 font-medium">
                A temporary display refresh is needed. Click below to continue directly into your shop dashboard.
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full h-12 rounded-full bg-[#D4623B] hover:bg-[#D4623B]/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Enter Dukaan Dashboard</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
