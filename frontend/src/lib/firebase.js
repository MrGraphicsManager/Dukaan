import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDraHQIeriaHVTunPqCKdHP_NSuHWBXx-s",
  authDomain: "dukaan-990f3.firebaseapp.com",
  projectId: "dukaan-990f3",
  storageBucket: "dukaan-990f3.firebasestorage.app",
  messagingSenderId: "525619414029",
  appId: "1:525619414029:web:577a19ac508a7c2de18144",
  measurementId: "G-P4Y49VFHD9"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export { RecaptchaVerifier, signInWithPhoneNumber };
export default app;
