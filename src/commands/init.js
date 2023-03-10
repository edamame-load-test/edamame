import ora from "ora";
import cluster from "../utilities/cluster.js";
import cli from "../utilities/cli.js";
import userInput from "../utilities/userInput.js";

const init = () => {
  const spinner = ora("Creating Edamame Cluster...").start();
  cluster.create()
    .then(() => cli(spinner, "Configuring EBS Credentials..."))
    .then(() => cluster.configureEBSCreds())
    .then(() => userInput.processPassword())
    .then(() => cli(spinner, "Deploying Grafana, Postgres, & K6 Operator..."))
    .then(() => cluster.deployServersK6Op())
    .then(() => cli(spinner, "Cluster Configured. You can load test now!", "success"))
    .catch(error => cli(spinner, `Error creating cluster: ${error}`, "fail"));
};

export {
  init
};
