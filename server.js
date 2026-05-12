const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5000;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

async function handleAPI(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "POST" && url.pathname === "/api/login") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { userName, password } = JSON.parse(body);
        const response = await fetch(
          "https://api.clarizen.com/v2.0/services/authentication/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userName, password }),
          }
        );
        const data = await response.json();
        res.writeHead(response.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/attachment") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { sessionId, entityId } = JSON.parse(body);
        const response = await fetch(
          "https://api.clarizen.com/v2.0/services/attachment/get",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Session ${sessionId}`,
            },
            body: JSON.stringify({ entityId }),
          }
        );
        const data = await response.json();
        res.writeHead(response.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  const handled = await handleAPI(req, res);
  if (handled) return;

  let filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "text/plain";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(__dirname, "public", "index.html"), (err2, data2) => {
        if (err2) {
          res.writeHead(404);
          res.end("Not found");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data2);
        }
      });
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Blink-DG server running on http://0.0.0.0:${PORT}`);
});
