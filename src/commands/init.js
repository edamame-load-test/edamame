import cluster from "../utilities/cluster.js";
import Spinner from "../utilities/spinner.js";
import password from "../utilities/password.js";

const init = async (options) => {
  const zones = options.zones;
  const spinner = new Spinner(
    "Creating Edamame cluster... (this may take up to 20 minutes)"
  );

  try {
    await cluster.checkForAllInstallations();
    await cluster.create(zones);
    spinner.succeed("Successfully created Edamame cluster.");

    spinner.info("Configuring EBS credentials...");
    spinner.start();
    await cluster.configureEBSCreds();
    spinner.succeed("Successfully configured EBS credentials.");
    spinner.info("Setting up AWS Load Balancer Controller...");
    spinner.start();
    await cluster.setupAWSLoadBalancerController();
    spinner.succeed("Set up AWS Load Balancer Controller."); 

    await password.assign();
    spinner.info("Deploying Grafana, Postgres, & K6 Operator...");
    spinner.start();
    await cluster.deployServersK6Op();
    spinner.succeed("Cluster configured. Welcome to Edamame!");
  } catch (err) {
    spinner.fail(`Error creating cluster: ${err}`);
    if (err["stdout"]) console.log(err["stdout"]);
  }
};

export { init };
