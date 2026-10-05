const { handler } = require("./_core.js");

async function getRawBody(req) {
  if (req.body) {
    return typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  }
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(data);
    });
    req.on("error", () => {
      resolve("");
    });
  });
}

module.exports = async function handleRoute(req, res, targetRoute) {
  try {
    const parsedUrl = new URL(req.url, `https://${req.headers.host || "localhost"}`);
    const route = targetRoute || parsedUrl.searchParams.get("route") || req.query?.route || parsedUrl.pathname.split("/").filter(Boolean).pop() || "";
    const body = await getRawBody(req);

    const event = {
      httpMethod: req.method,
      path: `/${route}`,
      headers: req.headers,
      body,
    };

    const result = await handler(event);

    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        res.setHeader(key, value);
      }
    }

    res.status(result.statusCode).send(result.body);
  } catch (error) {
    console.error("Vercel API Handler Error:", error);
    res.status(500).json({ error: "server_error", message: error?.message || "Internal server error" });
  }
};
