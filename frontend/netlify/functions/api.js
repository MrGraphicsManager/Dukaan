const tls = require("tls");

// Mail Configuration (GoDaddy / Titan Mail)
const SMTP_HOST = process.env.SMTP_HOST || "smtpout.secureserver.net";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER || "contact@officialdukaan.in";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "Viral@1979";
const EMAIL_FROM = "Dukaan <contact@officialdukaan.in>";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://officialdukaan.in";
const ADMIN_EMAIL = "contact@officialdukaan.in";

// Global Platform Configuration (Enterprise Suite Features)
let globalPlatformConfig = {
  maintenance_mode: false,
  announcement: "",
  updated_at: new Date().toISOString(),
  pricing: {
    starter: { monthly: 499, yearly: 4990 },
    business: { monthly: 999, yearly: 9990 },
    premium: { monthly: 1999, yearly: 19990 }
  },
  trial_days: 14,
  ota_version: 1,
  kill_switch_active: false,
  kill_switch_at: null,
  receipt_branding_enabled: true,
  payment_alert_chime: true,
  soundbox_devices: [],
  custom_domains: [],
  granted_subscriptions: {
    "support@officialdukaan.in": {
      plan: "premium",
      status: "active",
      expires_at: "2036-09-01T00:00:00.000Z",
      days: 3650,
      granted_by: "contact@officialdukaan.in",
      granted_at: new Date().toISOString(),
      note: "Lifetime Master Access"
    }
  },
  frozen_merchants: {},
  verified_merchants: {
    "support@officialdukaan.in": true
  }
};

const CLOUD_STATE_ID = process.env.DUKAAN_CLOUD_STATE_ID || "ff808181a067127101a06df9da67143f";
const CLOUD_STATE_URL = `https://api.restful-api.dev/objects/${CLOUD_STATE_ID}`;

let registeredUsersList = [
  {
    id: "usr_admin_master",
    name: "Super Administrator",
    email: ADMIN_EMAIL,
    is_admin: true,
    is_verified: true,
    subscription: { plan: "premium", status: "active", expires_at: new Date(Date.now() + 365 * 10 * 86400000).toISOString() },
    created_at: new Date().toISOString()
  },
  {
    id: "usr_priyen_master",
    name: "Naik Priyen",
    email: "support@officialdukaan.in",
    is_admin: false,
    is_verified: true,
    subscription: {
      plan: "premium",
      status: "active",
      expires_at: "2036-09-01T00:00:00.000Z",
      days: 3650,
      granted_by: ADMIN_EMAIL,
      granted_at: new Date().toISOString(),
      note: "Lifetime Master Access"
    },
    created_at: new Date().toISOString()
  }
];

let lastCloudFetchTime = 0;
async function getPersistentState(force = false) {
  const now = Date.now();
  if (!force && (now - lastCloudFetchTime < 1500)) {
    return globalPlatformConfig;
  }
  try {
    const res = await fetch(CLOUD_STATE_URL, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        lastCloudFetchTime = now;
        if (typeof json.data.maintenance_mode === "boolean") {
          globalPlatformConfig.maintenance_mode = json.data.maintenance_mode;
        }
        if (typeof json.data.announcement === "string") {
          globalPlatformConfig.announcement = json.data.announcement;
        }
        if (typeof json.data.ota_version === "number") {
          globalPlatformConfig.ota_version = json.data.ota_version;
        }
        if (typeof json.data.kill_switch_active === "boolean") {
          globalPlatformConfig.kill_switch_active = json.data.kill_switch_active;
        }
        if (json.data.granted_subscriptions) {
          globalPlatformConfig.granted_subscriptions = {
            ...globalPlatformConfig.granted_subscriptions,
            ...json.data.granted_subscriptions
          };
        }
        if (json.data.frozen_merchants) {
          globalPlatformConfig.frozen_merchants = {
            ...globalPlatformConfig.frozen_merchants,
            ...json.data.frozen_merchants
          };
        }
        if (json.data.verified_merchants) {
          globalPlatformConfig.verified_merchants = {
            ...globalPlatformConfig.verified_merchants,
            ...json.data.verified_merchants
          };
        }
        if (Array.isArray(json.data.registered_users)) {
          for (const u of json.data.registered_users) {
            if (!u || !u.email) continue;
            const em = u.email.toLowerCase();
            const idx = registeredUsersList.findIndex(x => x.email.toLowerCase() === em);
            if (idx >= 0) {
              registeredUsersList[idx] = { ...registeredUsersList[idx], ...u };
            } else {
              registeredUsersList.push(u);
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn("Persistent cloud state fetch error:", e.message);
  }
  return globalPlatformConfig;
}

async function savePersistentState(extraConfig = {}) {
  globalPlatformConfig = {
    ...globalPlatformConfig,
    ...extraConfig,
    updated_at: new Date().toISOString()
  };
  try {
    const payload = {
      name: "dukaan_platform_state",
      data: {
        maintenance_mode: globalPlatformConfig.maintenance_mode,
        announcement: globalPlatformConfig.announcement,
        ota_version: globalPlatformConfig.ota_version,
        kill_switch_active: globalPlatformConfig.kill_switch_active,
        granted_subscriptions: globalPlatformConfig.granted_subscriptions || {},
        frozen_merchants: globalPlatformConfig.frozen_merchants || {},
        verified_merchants: globalPlatformConfig.verified_merchants || {},
        registered_users: registeredUsersList
      }
    };
    await fetch(CLOUD_STATE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3500)
    });
  } catch (e) {
    console.warn("Persistent cloud state save error:", e.message);
  }
}

function recordRegisteredUser(userObj) {
  if (!userObj || !userObj.email) return;
  const email = userObj.email.toLowerCase();
  const existing = registeredUsersList.find(u => u.email.toLowerCase() === email);
  if (existing) {
    if (userObj.name) existing.name = userObj.name;
    if (userObj.subscription) existing.subscription = userObj.subscription;
    if (userObj.is_verified !== undefined) existing.is_verified = userObj.is_verified;
    if (userObj.is_frozen !== undefined) existing.is_frozen = userObj.is_frozen;
  } else {
    registeredUsersList.push({
      id: userObj.id || `usr_${Date.now()}`,
      name: userObj.name || email.split("@")[0],
      email: email,
      is_admin: email === ADMIN_EMAIL,
      is_verified: userObj.is_verified !== undefined ? userObj.is_verified : true,
      is_frozen: userObj.is_frozen || false,
      subscription: userObj.subscription || { plan: "starter", status: "active" },
      created_at: new Date().toISOString()
    });
  }
}

let promoCodes = [];
let supportTickets = [];
let merchantFeedbacks = [];
let referralCodes = [];

// Core SMTPS socket sender with RFC 822 Base64 Transfer Encoding (100% GoDaddy / Secureserver compliant)
function sendMailSocket({ host, port, user, pass, to, subject, html }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port, minVersion: "TLSv1.2" }, () => {});

    let step = 0;
    socket.on("data", (data) => {
      const msg = data.toString();
      if (step === 0 && msg.startsWith("220")) {
        step = 1;
        socket.write("EHLO officialdukaan.in\r\n");
      } else if (step === 1 && msg.includes("250")) {
        step = 2;
        socket.write("AUTH LOGIN\r\n");
      } else if (step === 2 && msg.startsWith("334")) {
        step = 3;
        socket.write(Buffer.from(user).toString("base64") + "\r\n");
      } else if (step === 3 && msg.startsWith("334")) {
        step = 4;
        socket.write(Buffer.from(pass).toString("base64") + "\r\n");
      } else if (step === 4 && msg.startsWith("235")) {
        step = 5;
        socket.write(`MAIL FROM:<${user}>\r\n`);
      } else if (step === 5 && msg.startsWith("250")) {
        step = 6;
        socket.write(`RCPT TO:<${to}>\r\n`);
      } else if (step === 6 && msg.startsWith("250")) {
        step = 7;
        socket.write("DATA\r\n");
      } else if (step === 7 && msg.startsWith("354")) {
        step = 8;
        // Strict RFC 822 Base64 chunking to prevent "552 Message contains bare LF" errors
        const b64Body = Buffer.from(html, "utf-8").toString("base64");
        const chunks = b64Body.match(/.{1,76}/g) || [];
        const formattedBody = chunks.join("\r\n");

        const mail = [
          `From: ${EMAIL_FROM}`,
          `To: <${to}>`,
          `Subject: ${subject}`,
          "MIME-Version: 1.0",
          "Content-Type: text/html; charset=utf-8",
          "Content-Transfer-Encoding: base64",
          "",
          formattedBody,
          ".\r\n"
        ].join("\r\n");
        socket.write(mail);
      } else if (step === 8 && msg.startsWith("250")) {
        step = 9;
        socket.write("QUIT\r\n");
        resolve(true);
      } else if (msg.startsWith("5")) {
        reject(new Error(`SMTP error from ${host}: ${msg.trim()}`));
      }
    });

    socket.on("error", (err) => reject(err));
    socket.setTimeout(12000, () => {
      socket.destroy();
      reject(new Error(`SMTP timeout connecting to ${host}:${port}`));
    });
  });
}

async function sendMailWithFallback({ to, subject, html }) {
  const hosts = [SMTP_HOST];
  if (SMTP_HOST.includes("secureserver.net")) {
    hosts.push("smtp.titan.email");
  } else if (SMTP_HOST.includes("titan.email")) {
    hosts.push("smtpout.secureserver.net");
  }

  let lastErr = null;
  for (const host of hosts) {
    try {
      console.log(`Attempting SMTP send to ${to} via ${host}:${SMTP_PORT}...`);
      await sendMailSocket({
        host,
        port: SMTP_PORT,
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
        to,
        subject,
        html
      });
      console.log(`Email successfully dispatched to ${to} via ${host}`);
      return true;
    } catch (e) {
      lastErr = e;
      console.warn(`Failed on ${host}: ${e.message}`);
    }
  }
  throw lastErr || new Error("Failed to dispatch email across candidate SMTP hosts");
}

function makeToken(userData) {
  return "duk_" + Buffer.from(JSON.stringify(userData)).toString("base64url");
}

function parseToken(authHeader) {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(?:duk_)?([A-Za-z0-9_-]+)/);
  if (!match) return null;
  try {
    const json = Buffer.from(match[1], "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (e) {
    return null;
  }
}

exports.handler = async (event, context) => {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Shop-Id",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const rawPath = event.path || "";
  const path = rawPath.replace(/^\/\.netlify\/functions\/api/, "").replace(/^\/api/, "");
  console.log(`Incoming request: ${event.httpMethod} ${path} (raw: ${rawPath})`);

  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      body = {};
    }
  }

  try {
    // Health check
    if (path === "/health" || path === "") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, status: "healthy", service: "Official Dukaan Serverless API" })
      };
    }

    // 1. REGISTER
    if (path === "/auth/register" && event.httpMethod === "POST") {
      const email = (body.email || "").trim().toLowerCase();
      const name = (body.name || "").trim();
      const password = body.password || "";

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ detail: "Email and password are required." })
        };
      }

      if (password.length < 8) {
        return { statusCode: 422, headers, body: JSON.stringify({ detail: "Password must be at least 8 characters long." }) };
      }
      if (!/[A-Z]/.test(password)) {
        return { statusCode: 422, headers, body: JSON.stringify({ detail: "Password must contain at least one capital letter (A-Z)." }) };
      }
      if (!/[0-9]/.test(password)) {
        return { statusCode: 422, headers, body: JSON.stringify({ detail: "Password must contain at least one number (0-9)." }) };
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { statusCode: 422, headers, body: JSON.stringify({ detail: "Password must contain at least one special symbol (!@#$%...)." }) };
      }

      const verification_code = String(Math.floor(100000 + Math.random() * 900000));
      const verification_token = "tok_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
      const verifyLink = `${FRONTEND_URL}/verify-email?token=${verification_token}&email=${encodeURIComponent(email)}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E8E5DF; border-radius: 16px; background-color: #FAF6F0;">
          <h2 style="color: #1B1464; margin-bottom: 8px;">Welcome to Dukaan!</h2>
          <p style="color: #4A4A4A; font-size: 14px; line-height: 1.5;">Thank you for registering. Please verify your email address to activate your account and select your subscription plan.</p>
          <div style="margin: 24px 0; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #D4623B; background: #FFFFFF; padding: 14px 28px; border-radius: 12px; border: 2px dashed #D4623B; display: inline-block;">${verification_code}</div>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verifyLink}" style="background-color: #D4623B; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block; font-size: 14px;">Verify Email Address</a>
          </div>
          <p style="color: #888888; font-size: 12px; text-align: center; margin-top: 16px;">This verification code and link will expire in 24 hours.</p>
        </div>
      `;

      try {
        await sendMailWithFallback({
          to: email,
          subject: "Verify your Dukaan account",
          html
        });
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          need_verification: true,
          email,
          verification_code,
          verification_token,
          message: "Account created! A verification code has been sent to your email.",
          user: {
            id: `usr_${Date.now()}`,
            name,
            email,
            is_verified: false
          }
        })
      };
    }

    // 2. LOGIN
    if (path === "/auth/login" && event.httpMethod === "POST") {
      await getPersistentState();
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";
      const name = (body.name || "").trim() || email.split("@")[0];
      if (!email || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ detail: "Email and password are required." }) };
      }
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
      if (isAdmin && password !== "Viral@1979") {
        return { statusCode: 401, headers, body: JSON.stringify({ detail: "Incorrect admin password. Please try again." }) };
      }

      const granted = globalPlatformConfig.granted_subscriptions?.[email];
      const isFrozen = !!globalPlatformConfig.frozen_merchants?.[email];
      const isVerified = globalPlatformConfig.verified_merchants?.[email] !== undefined 
        ? globalPlatformConfig.verified_merchants[email] 
        : true;

      const user = {
        id: `usr_${Date.now()}`,
        name,
        email,
        is_verified: isVerified,
        is_frozen: isFrozen,
        is_admin: isAdmin,
        subscription: granted || null,
        is_premium: granted?.plan === "premium"
      };

      recordRegisteredUser(user);
      savePersistentState().catch(() => {});

      const token = makeToken(user);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          access_token: token,
          token_type: "bearer",
          user
        })
      };
    }

    // 2B. RESET PASSWORD
    if (path === "/auth/reset-password" && event.httpMethod === "POST") {
      const { email, new_password } = body;
      if (!new_password || new_password.length < 8) {
        return { statusCode: 400, headers, body: JSON.stringify({ detail: "Password must be at least 8 characters." }) };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, message: "Password reset successfully! You can now log in." })
      };
    }

    // 2C. CHANGE PASSWORD
    if (path === "/auth/change-password" && event.httpMethod === "POST") {
      const { new_password } = body;
      if (!new_password || new_password.length < 8) {
        return { statusCode: 400, headers, body: JSON.stringify({ detail: "Password must be at least 8 characters." }) };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, message: "Password updated successfully!" })
      };
    }

    // 2D. UPDATE PROFILE
    if ((path === "/auth/update-profile" || path === "/auth/profile") && (event.httpMethod === "POST" || event.httpMethod === "PUT")) {
      const authHeader = event.headers.authorization || event.headers.Authorization || "";
      let user = parseToken(authHeader) || {};
      if (body.name) user.name = body.name.trim();
      if (body.phone) user.phone = body.phone.trim();
      if (body.avatar !== undefined) user.avatar = body.avatar;

      const new_token = makeToken(user);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, user, access_token: new_token })
      };
    }

    // 3. CURRENT USER (ME)
    if ((path === "/auth/me" || path === "/users/me") && event.httpMethod === "GET") {
      await getPersistentState();
      const authHeader = event.headers.authorization || event.headers.Authorization || "";
      const userFromToken = parseToken(authHeader);

      if (userFromToken && userFromToken.email) {
        const email = userFromToken.email.toLowerCase();
        const granted = globalPlatformConfig.granted_subscriptions?.[email];
        const isFrozen = !!globalPlatformConfig.frozen_merchants?.[email];
        const isVerified = globalPlatformConfig.verified_merchants?.[email] !== undefined 
          ? globalPlatformConfig.verified_merchants[email] 
          : (userFromToken.is_verified ?? true);

        const mergedUser = {
          ...userFromToken,
          is_admin: email === ADMIN_EMAIL,
          is_frozen: isFrozen,
          is_verified: isVerified
        };

        if (granted) {
          mergedUser.subscription = granted;
          if (granted.plan === "premium") mergedUser.is_premium = true;
        }

        recordRegisteredUser(mergedUser);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(mergedUser)
        };
      }

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ detail: "Not authenticated" })
      };
    }

    // 4. RESEND VERIFICATION
    if (path === "/auth/resend-verification" && event.httpMethod === "POST") {
      const email = (body.email || "").trim().toLowerCase();
      if (!email) {
        return { statusCode: 400, headers, body: JSON.stringify({ detail: "Email is required." }) };
      }

      const verification_code = String(Math.floor(100000 + Math.random() * 900000));
      const verification_token = "tok_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
      const verifyLink = `${FRONTEND_URL}/verify-email?token=${verification_token}&email=${encodeURIComponent(email)}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E8E5DF; border-radius: 16px; background-color: #FAF6F0;">
          <h2 style="color: #1B1464; margin-bottom: 8px;">Your New Dukaan Verification Code</h2>
          <p style="color: #4A4A4A; font-size: 14px; line-height: 1.5;">Here is your requested verification code to activate your Dukaan account:</p>
          <div style="margin: 24px 0; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #D4623B; background: #FFFFFF; padding: 14px 28px; border-radius: 12px; border: 2px dashed #D4623B; display: inline-block;">${verification_code}</div>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verifyLink}" style="background-color: #D4623B; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block; font-size: 14px;">Verify Email Address</a>
          </div>
        </div>
      `;

      try {
        await sendMailWithFallback({
          to: email,
          subject: "Your new Dukaan verification code",
          html
        });
      } catch (err) {
        console.error("Failed to send resend email:", err);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          verification_code,
          verification_token,
          message: "A new verification code has been dispatched to your email."
        })
      };
    }

    // 3. FORGOT PASSWORD
    if (path === "/auth/forgot-password" && event.httpMethod === "POST") {
      const email = (body.email || "").trim().toLowerCase();
      if (!email) {
        return { statusCode: 400, headers, body: JSON.stringify({ detail: "Email is required." }) };
      }

      const reset_code = String(Math.floor(100000 + Math.random() * 900000));
      const reset_token = "rst_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
      const resetLink = `${FRONTEND_URL}/reset-password?token=${reset_token}&email=${encodeURIComponent(email)}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E8E5DF; border-radius: 16px; background-color: #FAF6F0;">
          <h2 style="color: #1B1464; margin-bottom: 8px;">Reset Your Dukaan Password</h2>
          <p style="color: #4A4A4A; font-size: 14px; line-height: 1.5;">You requested to reset your password. Use the 6-digit code below or click the button:</p>
          <div style="margin: 24px 0; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #D4623B; background: #FFFFFF; padding: 14px 28px; border-radius: 12px; border: 2px dashed #D4623B; display: inline-block;">${reset_code}</div>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #D4623B; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block; font-size: 14px;">Reset Password</a>
          </div>
          <p style="color: #888888; font-size: 12px; text-align: center; margin-top: 16px;">If you did not request this password reset, you can safely ignore this email.</p>
        </div>
      `;

      try {
        await sendMailWithFallback({
          to: email,
          subject: "Reset your Dukaan password",
          html
        });
      } catch (err) {
        console.error("Failed to send forgot password email:", err);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          reset_code,
          reset_token,
          message: "If an account exists with this email, a reset code has been sent."
        })
      };
    }

    // 4. VERIFY EMAIL
    if (path === "/auth/verify-email" && event.httpMethod === "POST") {
      const email = (body.email || "").trim().toLowerCase();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          message: "Email verified successfully.",
          user: { email, is_verified: true }
        })
      };
    }

    // 5. SOCIAL LOGIN (Google & Apple)
    if (path === "/auth/social-login" && event.httpMethod === "POST") {
      await getPersistentState();
      const email = (body.email || "").trim().toLowerCase();
      const name = (body.name || (body.provider === "google" ? "Google User" : "Apple User")).trim();
      const provider = body.provider || "google";
      const avatar = body.avatar || "";

      if (!email) {
        return { statusCode: 400, headers, body: JSON.stringify({ detail: "Email is required for social sign-in." }) };
      }

      const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
      const granted = globalPlatformConfig.granted_subscriptions?.[email];
      const isFrozen = !!globalPlatformConfig.frozen_merchants?.[email];
      const isVerified = globalPlatformConfig.verified_merchants?.[email] !== undefined 
        ? globalPlatformConfig.verified_merchants[email] 
        : true;

      const user = {
        id: `usr_${Date.now()}`,
        name,
        email,
        avatar,
        is_verified: isVerified,
        is_frozen: isFrozen,
        is_admin: isAdmin,
        provider,
        subscription: granted || null,
        is_premium: granted?.plan === "premium"
      };

      recordRegisteredUser(user);
      savePersistentState().catch(() => {});

      const token = makeToken(user);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          access_token: token,
          token_type: "bearer",
          message: `Successfully authenticated via ${provider}`,
          user
        })
      };
    }

    // 5B. GOOGLE CODE EXCHANGE
    if (path === "/auth/google-exchange" && event.httpMethod === "POST") {
      const code = body.code;
      const redirect_uri = body.redirect_uri || `${FRONTEND_URL}/auth/google/callback`;
      if (!code) {
        return { statusCode: 400, headers, body: JSON.stringify({ detail: "Missing code" }) };
      }
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "682420913410-dfarb0n3e5a44vsh32fh1hh5j4ig0n6r.apps.googleusercontent.com",
            redirect_uri,
            grant_type: "authorization_code"
          }).toString()
        });
        const tokenData = await tokenRes.json();
        return { statusCode: tokenRes.status || 200, headers, body: JSON.stringify(tokenData) };
      } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ detail: err.message }) };
      }
    }

    // 6. GENERIC SEND EMAIL
    if (path === "/send-email" && event.httpMethod === "POST") {
      const { to, subject, html } = body;
      if (!to || !subject || !html) {
        return { statusCode: 400, headers, body: JSON.stringify({ detail: "Missing to, subject, or html." }) };
      }
      await sendMailWithFallback({ to, subject, html });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, message: `Email sent to ${to}` })
      };
    }

    // 7. SUBSCRIPTIONS - TRIAL MANDATE
    if (path === "/subscriptions/trial" && event.httpMethod === "POST") {
      const plan = body.plan || "business";
      const trialDays = plan === "starter" ? 90 : plan === "business" ? 60 : 30;
      const expires_at = body.expires_at || new Date(Date.now() + trialDays * 86400000).toISOString();
      const subscription = {
        plan,
        status: "active",
        is_trial: true,
        trial_days: trialDays,
        razorpay_payment_id: body.razorpay_payment_id || `pay_trial_${Date.now()}`,
        mandate_verified: true,
        amount: body.amount || 1,
        expires_at,
        activated_at: new Date().toISOString()
      };

      const authHeader = event.headers.authorization || event.headers.Authorization || "";
      let user = parseToken(authHeader) || {};
      user.subscription = subscription;
      if (plan === "premium") user.is_premium = true;
      const new_token = makeToken(user);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          subscription,
          access_token: new_token,
          user
        })
      };
    }

    // 8. SUBSCRIPTIONS - RAZORPAY VERIFY (PAID)
    if (path === "/subscriptions/razorpay/verify" && event.httpMethod === "POST") {
      const plan = body.plan || "business";
      const isAnnual = Boolean(body.annual);
      const durationDays = isAnnual ? 365 : 30;
      const expires_at = body.expires_at || new Date(Date.now() + durationDays * 86400000).toISOString();
      const subscription = {
        plan,
        status: "active",
        is_annual: isAnnual,
        razorpay_order_id: body.razorpay_order_id,
        razorpay_payment_id: body.razorpay_payment_id || `pay_rzp_${Date.now()}`,
        expires_at,
        activated_at: new Date().toISOString()
      };

      const authHeader = event.headers.authorization || event.headers.Authorization || "";
      let user = parseToken(authHeader) || {};
      user.subscription = subscription;
      if (plan === "premium") user.is_premium = true;
      const new_token = makeToken(user);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          subscription,
          access_token: new_token,
          user
        })
      };
    }

    // 9. SUBSCRIPTIONS - ME
    if (path === "/subscriptions/me" && event.httpMethod === "GET") {
      await getPersistentState();
      const authHeader = event.headers.authorization || event.headers.Authorization || "";
      const user = parseToken(authHeader);
      const email = (user?.email || "").toLowerCase();
      const granted = email ? globalPlatformConfig.granted_subscriptions?.[email] : null;
      const activeSub = granted || user?.subscription || null;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          active: activeSub,
          subscription: activeSub
        })
      };
    }

    // 9B. ADMIN GRANT SUBSCRIPTION
    if (path === "/admin/subscriptions/grant" && event.httpMethod === "POST") {
      await getPersistentState();
      const targetEmail = (body.user_email || "").trim().toLowerCase();
      if (!targetEmail) {
        return { statusCode: 400, headers, body: JSON.stringify({ detail: "User email is required." }) };
      }
      const plan = (body.plan || "premium").toLowerCase();
      const days = Number(body.days) || 365;
      const expDate = new Date(Date.now() + days * 86400000).toISOString();
      const note = body.note || "Manual grant by master admin";

      if (!globalPlatformConfig.granted_subscriptions) {
        globalPlatformConfig.granted_subscriptions = {};
      }
      const grantRecord = {
        plan,
        status: "active",
        expires_at: expDate,
        is_trial: false,
        days,
        granted_by: ADMIN_EMAIL,
        granted_at: new Date().toISOString(),
        note
      };
      globalPlatformConfig.granted_subscriptions[targetEmail] = grantRecord;

      if (!globalPlatformConfig.verified_merchants) {
        globalPlatformConfig.verified_merchants = {};
      }
      globalPlatformConfig.verified_merchants[targetEmail] = true;

      recordRegisteredUser({
        email: targetEmail,
        name: targetEmail.split("@")[0],
        subscription: grantRecord,
        is_verified: true
      });

      // Bump OTA version so connected clients immediately re-sync & unlock
      globalPlatformConfig.ota_version = (globalPlatformConfig.ota_version || 1) + 1;

      await savePersistentState();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          message: `Successfully granted ${plan.toUpperCase()} plan to ${targetEmail} for ${days} days!`,
          subscription: grantRecord
        })
      };
    }

    // 9C. ADMIN USERS FREEZE & VERIFY CONTROLS
    if (path === "/admin/users/freeze" && event.httpMethod === "POST") {
      await getPersistentState();
      const targetEmail = (body.email || "").trim().toLowerCase();
      const isFrozen = Boolean(body.is_frozen);
      if (!globalPlatformConfig.frozen_merchants) globalPlatformConfig.frozen_merchants = {};
      globalPlatformConfig.frozen_merchants[targetEmail] = isFrozen;
      globalPlatformConfig.ota_version = (globalPlatformConfig.ota_version || 1) + 1;
      await savePersistentState();
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, email: targetEmail, is_frozen: isFrozen }) };
    }

    if (path === "/admin/users/verify" && event.httpMethod === "POST") {
      await getPersistentState();
      const targetEmail = (body.email || "").trim().toLowerCase();
      const isVerified = Boolean(body.is_verified);
      if (!globalPlatformConfig.verified_merchants) globalPlatformConfig.verified_merchants = {};
      globalPlatformConfig.verified_merchants[targetEmail] = isVerified;
      await savePersistentState();
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, email: targetEmail, is_verified: isVerified }) };
    }

    // 10. ADMIN SUBSCRIPTIONS & STATS
    if (path === "/admin/subscriptions" && event.httpMethod === "GET") {
      await getPersistentState();
      const subs = [
        {
          id: "sub_master_admin",
          user_email: ADMIN_EMAIL,
          payer_name: "Master Administrator",
          plan: "premium",
          status: "active",
          amount: 0,
          source: "system_master",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 10 * 86400000).toISOString()
        }
      ];

      if (globalPlatformConfig.granted_subscriptions) {
        for (const [em, gSub] of Object.entries(globalPlatformConfig.granted_subscriptions)) {
          if (em.toLowerCase() === ADMIN_EMAIL.toLowerCase()) continue;
          subs.push({
            id: `sub_grant_${em.replace(/[^a-z0-9]/gi, "_")}`,
            user_email: em,
            payer_name: em.split("@")[0],
            phone: "919979314819",
            plan: gSub.plan || "premium",
            status: gSub.status || "active",
            amount: gSub.plan === "premium" ? 2990 : gSub.plan === "business" ? 1490 : 990,
            source: "admin_grant",
            review_note: gSub.note,
            created_at: gSub.granted_at || new Date().toISOString(),
            expires_at: gSub.expires_at
          });
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(subs)
      };
    }

    if (path === "/admin/stats" && event.httpMethod === "GET") {
      await getPersistentState();
      const grantedCount = Object.keys(globalPlatformConfig.granted_subscriptions || {}).length;
      const totalUsers = Math.max(1, registeredUsersList.length);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          users: totalUsers,
          shops: totalUsers,
          active_subscriptions: Math.max(1, grantedCount),
          pending_subscriptions: 0,
          total_revenue: 0,
          active_trials: 0,
          starter_count: 0,
          business_count: 0,
          premium_count: Math.max(1, grantedCount)
        })
      };
    }

    if (path === "/admin/users" && event.httpMethod === "GET") {
      await getPersistentState();
      const usersMap = new Map();

      // Master Admin
      usersMap.set(ADMIN_EMAIL.toLowerCase(), {
        id: "usr_admin_master",
        name: "Super Administrator",
        email: ADMIN_EMAIL,
        is_admin: true,
        is_verified: true,
        subscription: { plan: "premium", status: "active", expires_at: new Date(Date.now() + 365 * 10 * 86400000).toISOString() },
        created_at: new Date().toISOString()
      });

      // Registered users
      for (const u of registeredUsersList) {
        if (!u || !u.email) continue;
        const em = u.email.toLowerCase();
        const granted = globalPlatformConfig.granted_subscriptions?.[em];
        const isFrozen = !!globalPlatformConfig.frozen_merchants?.[em];
        const isVerified = globalPlatformConfig.verified_merchants?.[em] !== undefined 
          ? globalPlatformConfig.verified_merchants[em] 
          : (u.is_verified ?? true);

        usersMap.set(em, {
          ...u,
          is_admin: em === ADMIN_EMAIL.toLowerCase(),
          is_frozen: isFrozen,
          is_verified: isVerified,
          subscription: granted || u.subscription || { plan: "starter", status: "active" }
        });
      }

      // Any granted subscriptions not in usersMap yet
      if (globalPlatformConfig.granted_subscriptions) {
        for (const [em, sub] of Object.entries(globalPlatformConfig.granted_subscriptions)) {
          const lower = em.toLowerCase();
          if (!usersMap.has(lower)) {
            usersMap.set(lower, {
              id: `usr_${lower.replace(/[^a-z0-9]/gi, "_")}`,
              name: lower.split("@")[0],
              email: lower,
              is_admin: lower === ADMIN_EMAIL.toLowerCase(),
              is_verified: true,
              subscription: sub,
              created_at: sub.granted_at || new Date().toISOString()
            });
          } else {
            usersMap.get(lower).subscription = sub;
          }
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(Array.from(usersMap.values()))
      };
    }

    if (path === "/admin/gst-requests" && event.httpMethod === "GET") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }

    if (path.startsWith("/admin/gst-requests/") && event.httpMethod === "POST") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, message: "GST status updated successfully." })
      };
    }

    // 11. SHOPS MANAGEMENT
    if (path === "/shops" && event.httpMethod === "GET") {
      const authHeader = event.headers.authorization || event.headers.Authorization || "";
      const user = parseToken(authHeader);
      const uName = user?.name || "My";
      const defaultShop = {
        id: "shop_main",
        name: `${uName}'s Store`,
        owner_name: uName,
        phone: user?.phone || "",
        address: "India",
        upi_id: "",
        store_category: "General Store",
        gst_status: "pending",
        gst_enabled: false,
        financial_year: "2026-27",
        store_active: true
      };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([defaultShop])
      };
    }

    if (path === "/shops" && event.httpMethod === "POST") {
      const newShop = {
        id: `shop_${Date.now()}`,
        ...body,
        store_active: true
      };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(newShop)
      };
    }

    if (path.startsWith("/shops/") && (event.httpMethod === "PUT" || event.httpMethod === "POST")) {
      const shopId = path.replace("/shops/", "");
      const updatedShop = {
        id: shopId,
        ...body
      };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedShop)
      };
    }

    if (path.startsWith("/shops/") && event.httpMethod === "GET") {
      const shopId = path.replace("/shops/", "");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ id: shopId, name: "Apni Dukaan" })
      };
    }

    // 12. PLATFORM CONFIG (Maintenance, Dynamic Pricing, Branding, OTA, Emergency Switch)
    if (path === "/platform/config" && event.httpMethod === "GET") {
      await getPersistentState();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(globalPlatformConfig)
      };
    }

    if (path === "/platform/config" && event.httpMethod === "POST") {
      await getPersistentState();
      let modeChanged = false;
      if (typeof body.maintenance_mode === "boolean") {
        if (globalPlatformConfig.maintenance_mode !== body.maintenance_mode) {
          modeChanged = true;
        }
        globalPlatformConfig.maintenance_mode = body.maintenance_mode;
      }
      if (typeof body.announcement === "string") {
        globalPlatformConfig.announcement = body.announcement;
      }
      if (body.pricing && typeof body.pricing === "object") {
        globalPlatformConfig.pricing = { ...globalPlatformConfig.pricing, ...body.pricing };
      }
      if (typeof body.trial_days === "number") {
        globalPlatformConfig.trial_days = body.trial_days;
      }
      if (typeof body.receipt_branding_enabled === "boolean") {
        globalPlatformConfig.receipt_branding_enabled = body.receipt_branding_enabled;
      }
      if (typeof body.payment_alert_chime === "boolean") {
        globalPlatformConfig.payment_alert_chime = body.payment_alert_chime;
      }

      // Auto-bump OTA version on maintenance mode or announcement updates so merchants immediately reload / react!
      if (modeChanged || body.announcement !== undefined) {
        globalPlatformConfig.ota_version = (globalPlatformConfig.ota_version || 1) + 1;
      }

      globalPlatformConfig.updated_at = new Date().toISOString();
      await savePersistentState();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, config: globalPlatformConfig })
      };
    }

    // 13. OTA FORCE UPDATE
    if (path === "/platform/force-update" && event.httpMethod === "POST") {
      await getPersistentState();
      globalPlatformConfig.ota_version = (globalPlatformConfig.ota_version || 1) + 1;
      globalPlatformConfig.updated_at = new Date().toISOString();
      await savePersistentState();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, ota_version: globalPlatformConfig.ota_version, timestamp: globalPlatformConfig.updated_at })
      };
    }

    // 14. EMERGENCY SESSION KILL SWITCH
    if (path === "/platform/kill-switch" && event.httpMethod === "POST") {
      await getPersistentState();
      globalPlatformConfig.kill_switch_active = !globalPlatformConfig.kill_switch_active;
      globalPlatformConfig.kill_switch_at = globalPlatformConfig.kill_switch_active ? new Date().toISOString() : null;
      if (globalPlatformConfig.kill_switch_active) {
        globalPlatformConfig.ota_version = (globalPlatformConfig.ota_version || 1) + 1;
      }
      await savePersistentState();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, active: globalPlatformConfig.kill_switch_active, kill_switch_at: globalPlatformConfig.kill_switch_at })
      };
    }

    // 15. PROMO CODES (Disabled)
    if (path === "/promo-codes" && event.httpMethod === "GET") {
      return { statusCode: 200, headers, body: JSON.stringify([]) };
    }
    if (path === "/promo-codes/validate" && event.httpMethod === "POST") {
      return { statusCode: 400, headers, body: JSON.stringify({ valid: false, detail: "Coupon codes have been disabled." }) };
    }

    // 16. IN-APP CUSTOMER SUPPORT DESK
    if (path === "/support/tickets" && event.httpMethod === "GET") {
      return { statusCode: 200, headers, body: JSON.stringify(supportTickets) };
    }

    if (path === "/support/tickets" && event.httpMethod === "POST") {
      const authHeader = event.headers.authorization || event.headers.Authorization || "";
      const user = parseToken(authHeader);
      const newTicket = {
        id: `TCK_${Date.now().toString().slice(-4)}`,
        merchant_name: body.merchant_name || user?.name || "Merchant",
        merchant_email: body.merchant_email || user?.email || "merchant@store.in",
        phone: body.phone || user?.phone || "",
        subject: body.subject || "General Dukaan Query",
        priority: body.priority || "medium",
        status: "open",
        message: body.message || "",
        created_at: new Date().toISOString()
      };
      supportTickets.unshift(newTicket);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ticket: newTicket }) };
    }

    if (path.startsWith("/support/tickets/") && (event.httpMethod === "PUT" || event.httpMethod === "POST")) {
      const ticketId = path.replace("/support/tickets/", "").replace("/status", "");
      const idx = supportTickets.findIndex(t => t.id === ticketId);
      if (idx >= 0) {
        if (body.status) supportTickets[idx].status = body.status;
        if (body.admin_note) supportTickets[idx].admin_note = body.admin_note;
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ticket: supportTickets[idx] }) };
      }
      return { statusCode: 404, headers, body: JSON.stringify({ detail: "Ticket not found" }) };
    }

    // 17. MERCHANT FEEDBACK & NPS RATING WALL
    if (path === "/merchant/feedback" && event.httpMethod === "GET") {
      return { statusCode: 200, headers, body: JSON.stringify(merchantFeedbacks) };
    }

    if (path === "/merchant/feedback" && event.httpMethod === "POST") {
      const authHeader = event.headers.authorization || event.headers.Authorization || "";
      const user = parseToken(authHeader);
      const newFeedback = {
        id: `fb_${Date.now()}`,
        merchant_name: body.merchant_name || user?.name || "Verified Merchant",
        shop_name: body.shop_name || "Apni Dukaan",
        rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
        comment: (body.comment || "").trim(),
        created_at: new Date().toISOString()
      };
      merchantFeedbacks.unshift(newFeedback);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, feedback: newFeedback }) };
    }

    // 18. REFERRAL & PARTNER PROGRAM HUB
    if (path === "/admin/referrals" && event.httpMethod === "GET") {
      return { statusCode: 200, headers, body: JSON.stringify(referralCodes) };
    }

    if (path === "/admin/referrals/approve" && event.httpMethod === "POST") {
      const { id } = body;
      const item = referralCodes.find(r => r.id === id);
      if (item) {
        item.status = "approved";
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, referral: item }) };
      }
      return { statusCode: 404, headers, body: JSON.stringify({ detail: "Referral not found" }) };
    }

    // 19. RAZORPAY INSTANT PAYMENT RE-SYNC
    if (path === "/admin/payment-resync" && event.httpMethod === "POST") {
      const paymentId = (body.payment_id || "").trim();
      const email = (body.email || "").trim().toLowerCase();
      const plan = body.plan || "business";
      if (!paymentId || !email) {
        return { statusCode: 400, headers, body: JSON.stringify({ detail: "Payment ID and merchant email are required." }) };
      }
      const syncRecord = {
        id: `sub_resync_${Date.now()}`,
        user_email: email,
        payer_name: email.split("@")[0],
        plan,
        status: "active",
        amount: plan === "premium" ? 2990 : 999,
        payment_id: paymentId,
        source: "razorpay_resync",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 86400000).toISOString()
      };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          message: `Payment ${paymentId} successfully synced and plan ${plan.toUpperCase()} activated for 365 days.`,
          subscription: syncRecord
        })
      };
    }

    // 20. PUBLIC ONLINE STORE DIRECTORY (/stores)
    if (path === "/stores" && event.httpMethod === "GET") {
      const publicStores = [
        {
          id: "store_1",
          name: "Yug Super Mart & FMCG",
          owner: "Priyen Yug",
          category: "Grocery & Kirana",
          city: "Navsari",
          state: "Gujarat",
          phone: "919876543210",
          verified: true,
          rating: 4.9,
          items_count: 420,
          catalog_preview: ["Amul Butter", "Tata Salt", "Maggi 70g", "Fortune Oil"]
        },
        {
          id: "store_2",
          name: "Sharma Daily Needs & Dairy",
          owner: "Rajesh Sharma",
          category: "General Store",
          city: "Mumbai",
          state: "Maharashtra",
          phone: "919123456780",
          verified: true,
          rating: 4.8,
          items_count: 310,
          catalog_preview: ["Parle-G", "Britannia Good Day", "Dettol Soap"]
        },
        {
          id: "store_3",
          name: "Sanjivani Medicos & Pharmacy",
          owner: "Dr. Sandeep Mehta",
          category: "Medical Store & Pharmacy",
          city: "Jaipur",
          state: "Rajasthan",
          phone: "919822334455",
          verified: true,
          rating: 5.0,
          items_count: 560,
          catalog_preview: ["Paracetamol 650mg", "Azithromycin 500mg", "Dabur Chyawanprash"]
        },
        {
          id: "store_4",
          name: "Balaji Provisions & Wholesale",
          owner: "Venkatesh Rao",
          category: "Supermarket",
          city: "Bengaluru",
          state: "Karnataka",
          phone: "919744112233",
          verified: true,
          rating: 4.7,
          items_count: 890,
          catalog_preview: ["Aashirvaad Atta 10kg", "Red Label Tea 500g", "Surf Excel 1kg"]
        }
      ];
      return { statusCode: 200, headers, body: JSON.stringify(publicStores) };
    }

    // 21. HARDWARE SOUNDBOX & QR STANDEES
    if (path === "/admin/soundbox" && event.httpMethod === "GET") {
      return { statusCode: 200, headers, body: JSON.stringify(globalPlatformConfig.soundbox_devices || []) };
    }

    if (path === "/admin/soundbox" && event.httpMethod === "POST") {
      const newDev = {
        id: `SND_${Date.now().toString().slice(-4)}`,
        serial: body.serial || `DUK-SB-${Math.floor(10000 + Math.random() * 90000)}`,
        model: body.model || "4G 3W Audio Soundbox",
        shop_name: body.shop_name || "New Dukaan",
        battery: "100%",
        status: body.status || "online",
        sim: body.sim || "Jio IoT"
      };
      if (!globalPlatformConfig.soundbox_devices) globalPlatformConfig.soundbox_devices = [];
      globalPlatformConfig.soundbox_devices.push(newDev);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, device: newDev, devices: globalPlatformConfig.soundbox_devices }) };
    }

    // 22. CUSTOM DOMAINS / WHITE-LABEL DNS
    if (path === "/admin/custom-domains" && event.httpMethod === "GET") {
      return { statusCode: 200, headers, body: JSON.stringify(globalPlatformConfig.custom_domains || []) };
    }

    if (path === "/admin/custom-domains" && event.httpMethod === "POST") {
      const authHeader = event.headers.authorization || event.headers.Authorization || "";
      const user = parseToken(authHeader);
      const newDomain = {
        id: `cd_${Date.now()}`,
        user_email: body.user_email || user?.email || "merchant@store.in",
        shop_name: body.shop_name || "My Store",
        domain: (body.domain || "").trim().toLowerCase(),
        status: "pending_dns",
        ssl: "provisioning",
        cname_target: "custom.officialdukaan.in",
        created_at: new Date().toISOString()
      };
      if (!globalPlatformConfig.custom_domains) globalPlatformConfig.custom_domains = [];
      globalPlatformConfig.custom_domains.push(newDomain);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, domain: newDomain }) };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ detail: `Route ${path} not found on serverless API` })
    };
  } catch (err) {
    console.error("API Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ detail: err.message || "Internal server error" })
    };
  }
};
