import cluster from "../utilities/cluster.js";
import Spinner from "../utilities/spinner.js";
import userInput from "../utilities/userInput.js";

const init = async () => {
  const spinner = new Spinner("Creating Edamame cluster... (this may take up to 20 minutes)");

  try {
    await cluster.create();
    spinner.succeed("Successfully created Edamame cluster.");

    spinner.info("Configuring EBS credentials...");
    spinner.start();
    await cluster.configureEBSCreds();
    spinner.succeed("Successfully configured EBS credentials.");

    await userInput.processPassword()

    spinner.info("Deploying Grafana, Postgres, & K6 Operator...");
    spinner.start();
    const grafanaUrl = await cluster.deployServersK6Op();
    spinner.info(`Please find your Grafana dashboard at: ${grafanaUrl}`);
    spinner.succeed("Cluster configured. Welcome to Edamame!");
  } catch (err) {
    spinner.fail(`Error creating cluster: ${err}`);
  }
}

export {
  init
};
