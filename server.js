const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function handler(request, response) {
  try {
    let route = request.url || "/";

    // Remove query string
    route = route.split("?")[0];

    // Decode URL safely
    try {
      route = decodeURIComponent(route);
    } catch {
      response.writeHead(400);
      response.end("Bad Request");
      return;
    }

    // Homepage
    if (route === "/" || route === "") {
      route = "/index.html";
    }

    // Normalize the requested path
    const relativePath = route.replace(/^\/+/, "");
    const filePath = path.resolve(root, relativePath);

    // Prevent access outside project directory
    if (
      filePath !== root &&
      !filePath.startsWith(root + path.sep)
    ) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError || !stats.isFile()) {
        response.writeHead(404, {
          "Content-Type": "text/plain; charset=utf-8"
        });
        response.end("Not found");
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      const contentType =
        types[extension] || "application/octet-stream";

      response.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600"
      });

      // Stream large files such as PDFs instead of loading
      // the entire PDF into memory.
      const stream = fs.createReadStream(filePath);

      stream.on("error", () => {
        if (!response.headersSent) {
          response.writeHead(500);
        }
        response.end("Internal Server Error");
      });

      stream.pipe(response);
    });
  } catch (error) {
    console.error(error);

    if (!response.headersSent) {
      response.writeHead(500, {
        "Content-Type": "text/plain; charset=utf-8"
      });
    }

    response.end("Internal Server Error");
  }
}

// Vercel / Node handler
module.exports = handler;

// Local server
if (require.main === module) {
  const port = Number(process.env.PORT || 8088);

  http.createServer(handler).listen(port, "0.0.0.0", () => {
    console.log(
      `Flipbook magazine running at http://localhost:${port}`
    );
  });
}
