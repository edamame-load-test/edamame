import { frontend, backendServer } from "../utilities/dashboard.js";
import Spinner from "../utilities/spinner.js";

async function launchDashboard() {
  const spinner = new Spinner("Setting up your GUI");
  try {
    await backendServer.installPackages();
    await backendServer.start();
    await frontend.installPackages();
    await frontend.start();
    spinner.succeed(
      "Success! You can continue using terminal commands, or use the dashboard at localhost:3006"
    );
  } catch (err) {
    console.log(err);
    spinner.fail(`Error creating a your GUI`);
  }
}

export { launchDashboard };
