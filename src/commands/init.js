import ora from "ora";
import cdkApp from "../utilities/cdkApp.js";
import eksctl from "../utilities/eksctl.js";
import kubectl from "../utilities/kubectl.js";
import cli from "../utilities/cli.js";
import { processGrafPgUserCreds } from "../utilities/userInput.js";

const init = () => {
  const spinner = ora("Creating Edamame Cluster...").start();
  eksctl.makeCluster(spinner)
    .then(() => eksctl.configureEBSCreds(spinner))
    .then(() => processGrafPgUserCreds())
    //.then(() => deployGrafana())
    .then(() => kubectl.deployK6Op(spinner))
    //.then(() => deployPostgres())
    .then(() => {
      cli(
        spinner, 
        "Finished cluster configuration. You can run a load test now.", 
        "success"
      );
    })
    .catch(error => {
      cli(
        spinner,
        `Error while creating & configuring cluster: ${error}`,
        "fail"
      );
    });
};

export {
  init
};
