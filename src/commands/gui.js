import frontend from "../utilities/frontend.js";
import Spinner from "../utilities/spinner.js";

async function launchGui() {
  const spinner = new Spinner("Setting up your GUI");
  try {
    await frontend.installPackages();
    await frontend.start();
    spinner.succeed(
      "Success! You can continue using terminal commands, or use the GUI at localhost:3006"
    );
  } catch (err) {
    console.log(err);
    spinner.fail(`Error creating a your GUI`);
  }
}

export { launchGui };
