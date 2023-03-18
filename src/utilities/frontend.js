import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);
import { spawn } from "child_process";

const frontend = {
  installPackages() {
    return exec("cd .. && cd .. && cd frontend && npm install &");
  },

  async start() {
    const child = spawn("npm", ["start"], {
      cwd: "../../frontend", // set the working directory to the parent directory of the React app
      detached: true, // run the child process in detached mode
      stdio: "ignore", // ignore stdin, stdout, and stderr
    });
    child.unref();
  },
};

export default frontend;
