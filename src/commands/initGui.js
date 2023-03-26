import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Spinner from "../utilities/spinner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initGui() {
  const spinner = new Spinner("Initializing your dashboard");
  // Install backend packages
  const serverDir = join(__dirname, "..", "..", "dashboard", "backend-server");
  const serverInstall = spawn("npm", ["install"], { cwd: serverDir });
  serverInstall.stdout.on("close", () => {
    spinner.info("Installed packages for your backend");
    const frontendDir = join(__dirname, "..", "..", "dashboard", "frontend");
    const frontendInstall = spawn("npm", ["install"], { cwd: frontendDir });
    frontendInstall.stdout.on("close", () => {
      spinner.info("Installed packages for your frontend");
      const frontendInit = spawn("npm", ["run", "build"], { cwd: frontendDir });
      frontendInit.stdout.on("close", () => {
        spinner.info("Generated frontend build");
        const serverInit = spawn("npm", ["run", "start"], {
          cwd: serverDir,
          detached: true, // run the child process in detached mode
          stdio: "ignore", // ignore stdin, stdout, and stderr
        });
        serverInit.unref();
        spinner.succeed(
          "Your dashboard is now running at http://localhost:3001"
        );
      });
    });
  });

  // Bundle the react app
}

export { initGui };
