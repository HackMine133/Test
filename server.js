const http = require("http");
const fs = require("fs");
const path = require("path");

const defaultPort = 3000;
const envPort = Number.parseInt(process.env.PORT, 10);
const port = Number.isNaN(envPort) ? defaultPort : envPort;
const publicDir = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  const safePath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(publicDir, safePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Voxel sandbox running on http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. ` +
        `Set a different port with "PORT=3001 npm start" (macOS/Linux) ` +
        `or "set PORT=3001 && npm start" (Windows).`
    );
    process.exitCode = 1;
    return;
  }

  console.error("Server failed to start:", error);
  process.exitCode = 1;
});
