const { app, BrowserWindow, Menu, globalShortcut, shell } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: "Dukaan · Shop Assistant",
    icon: path.join(__dirname, "icon.png"),
    backgroundColor: "#FDF8F3",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // Identify as DukaanDesktop so web app directly skips landing page and enters /app
  const defaultUA = mainWindow.webContents.userAgent;
  mainWindow.webContents.userAgent = `${defaultUA} DukaanDesktop/1.0`;

  // Production URL (fallback to local build if offline)
  const isDev = process.env.NODE_ENV === "development";
  const appUrl = isDev 
    ? "http://localhost:3000/app" 
    : (process.env.DUKAAN_URL || "https://officialdukaan.in/app");

  mainWindow.loadURL(appUrl);

  // Handle external links (WhatsApp wa.me, etc.) in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://wa.me") || url.startsWith("https://api.whatsapp.com") || url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // F11 Kiosk / Fullscreen toggle for counter billing
  mainWindow.on("focus", () => {
    globalShortcut.register("F11", () => {
      const isFullScreen = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFullScreen);
    });
  });

  mainWindow.on("blur", () => {
    globalShortcut.unregister("F11");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
