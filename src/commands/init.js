import cdkApp from "../utilities/cdkApp.js";
import eksctl from "../utilities/eksctl.js";
import kubectl from "../utilities/kubectl.js";
import { processGrafPgUserCreds } from "../utilities/userInput.js";

const init = () => {
  eksctl.makeCluster()
    .then(() => eksctl.configureEBSCreds())
    .then(() => processGrafPgUserCreds())
    //.then(() => deployGrafana())
    .then(() => kubectl.deployK6Op())
    //.then(() => deployPostgres())
};

export {
  init
};
