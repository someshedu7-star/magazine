const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8088);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".pdf": "application/pdf"
};

http.createServer((request, response) => {
  let route = decodeURIComponent(request.url.split("?")[0]);
  if (route === "/" || route === "") route = "/index.html";

  const filePath = path.resolve(path.join(root, route));
  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    response.end(data);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Flipbook magazine running at http://localhost:${port}`);
});
