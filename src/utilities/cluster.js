import iam from "./iam.js";
import fullPath from "./path.js";
import cli from "./cli.js";
import eksctl from "./eksctl.js";
import kubectl from "./kubectl.js";
import cr from "./customResource.js";
import { K6_CR_FINAL } from "./constants.js";
const k6OpDeployPath = fullPath('../k6-operator/deployment');

const cluster = {
  create() { 
    return (
      eksctl.createCluster()
        .then(() => eksctl.createLoadGenGrp())
    );
  },

  configureEBSCreds() {
    return (
      eksctl.fetchOIDCs()
        .then(({stdout, stderr}) => {
          if (!iam.OIDCexists(stdout)) { 
            return eksctl.createOIDC();
          }
        })
        .then(() => eksctl.addIAMDriverRole())
        .then(() => eksctl.fetchIamRoles())
        .then(({stdout, stderr}) => {
          const role = iam.ebsRole(stdout);
          if (role) {
            return eksctl.addCsiDriver(role);
          }
        })
    );
  },

  deployServersK6Op() { 
    return (
      kubectl.deployK6Operator()
        //.then(() => kubectl.applyManifest(postgres_path))
        //.then(() => kubectl.applyManifest(grafana_path))
    );
   },

  phaseOutK6(configMapName) { 
    return (
      kubectl.deleteManifest(`${k6OpDeployPath}/statsite.yaml`)
        .then(() => kubectl.deleteConfigMap(configMapName))
        .then(() => eksctl.scaleLoadGenNodes(0))
        .then(() => kubectl.deleteManifest(`${k6OpDeployPath}/${K6_CR_FINAL}`))
    );
  },

  launchK6Test(testPath, numVus, name) {
    cr.createK6(testPath, numVus, name);
    const numNodes = cr.parallelism(numVus);

    return (
      kubectl.applyManifest(`${k6OpDeployPath}/statsite.yaml`)
        .then(() => kubectl.createConfigMap(name, testPath))
        .then(() => eksctl.scaleLoadGenNodes(numNodes))
        .then(() => kubectl.applyManifest(`${k6OpDeployPath}/${K6_CR_FINAL}`))
    );
  },

  destroy() {
    eksctl.destroyCluster()
    // add logic for tearing down persistent volume store
  }
};

export default cluster;
