const netlifyApi = require("../netlify/functions/api");

module.exports = async (req, res) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Shop-Id, X-User-Email, Cache-Control, Pragma");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    return res.status(200).end();
  }

  // Parse path and query parameters
  const host = req.headers.host || "officialdukaan.in";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const parsedUrl = new URL(req.url, `${protocol}://${host}`);

  let rawBody = "";
  if (req.body) {
    if (typeof req.body === "string") {
      rawBody = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString("utf-8");
    } else {
      rawBody = JSON.stringify(req.body);
    }
  }

  const queryParams = {};
  parsedUrl.searchParams.forEach((val, key) => {
    queryParams[key] = val;
  });

  const event = {
    httpMethod: req.method,
    path: parsedUrl.pathname,
    headers: req.headers,
    queryStringParameters: queryParams,
    body: rawBody
  };

  try {
    const result = await netlifyApi.handler(event, {});

    if (result.headers) {
      Object.entries(result.headers).forEach(([k, v]) => {
        res.setHeader(k, v);
      });
    }

    res.status(result.statusCode || 200);
    if (result.body) {
      res.send(result.body);
    } else {
      res.end();
    }
  } catch (err) {
    console.error("Vercel Serverless Function Execution Error:", err);
    res.status(500).json({ detail: "Internal Server Error", error: err.message });
  }
};
