import { backendServer } from "../utilities/dashboard.js";
import Spinner from "../utilities/spinner.js";

async function test() {
  const spinner = new Spinner("Setting up your UI");
  try {
    await backendServer.installPackages();
    spinner.succeed(
      "Success! You can continue using terminal commands, or use the UI at localhost:3006"
    );
  } catch (err) {
    console.log(err);
    spinner.fail(`Error creating your UI`);
  }
}

test();
