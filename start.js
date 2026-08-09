const { spawn } = require("child_process");
const path = require("path");

console.log("==================================================");
console.log("   SchemaShift — Terrarium PostgreSQL Sandbox    ");
console.log("      Node.js / Express / Prisma Backend Stack    ");
console.log("==================================================");

console.log("Starting Node.js/Express Backend on http://localhost:8000...");
const backendProcess = spawn("npm", ["run", "dev"], {
  cwd: path.join(__dirname, "backend"),
  shell: true,
  stdio: "inherit",
});

console.log("Starting Next.js Frontend on http://localhost:3000...");
const frontendProcess = spawn("npm", ["run", "dev"], {
  cwd: path.join(__dirname, "frontend"),
  shell: true,
  stdio: "inherit",
});

process.on("SIGINT", () => {
  console.log("\nShutting down SchemaShift services...");
  backendProcess.kill();
  frontendProcess.kill();
  process.exit();
});
