import cluster from "../utilities/cluster.js";
import Spinner from "../utilities/spinner.js";
import userInput from "../utilities/userInput.js";

const init = () => {
  const spinner = new Spinner("Creating Edamame Cluster...");
  cluster.create()
    .then(() => spinner.update("Configuring EBS Credentials..."))
    .then(() => cluster.configureEBSCreds())
    .then(() => userInput.processPassword())
    .then(() => spinner.update("Deploying Grafana, Postgres, & K6 Operator..."))
    .then(() => cluster.deployServersK6Op())
    .then(() => spinner.succeed("Cluster Configured. You can load test now!"))
    .catch(err => spinner.fail(`Error creating cluster: ${err}`));
};

export {
  init
};
