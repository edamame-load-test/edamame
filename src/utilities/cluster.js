import iam from "./iam.js";
import files from "./files.js";
import eksctl from "./eksctl.js";
import kubectl from "./kubectl.js";
import manifest from "./manifest.js";
import { 
  K6_CR_FILE,
  STATSITE_FILE,
  PG_SECRET_FILE,
  PG_CM_FILE,
  PG_SS_FILE,
  DB_API_FILE
} from "../constants/constants.js";

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
        .then(({stdout}) => {
          if (!iam.OIDCexists(stdout)) { 
            return eksctl.createOIDC();
          }
        })
        .then(() => eksctl.addIAMDriverRole())
        .then(() => eksctl.fetchIamRoles())
        .then(({stdout}) => {
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
        .then(() => kubectl.applyManifest(files.path(PG_SECRET_FILE)))
        .then(() => kubectl.createConfigMap(files.path(PG_CM_FILE)))
        .then(() => kubectl.applyManifest(files.path(PG_SS_FILE)))
        // when put in error handling, if need to reapply db api after its deleted
        //   will need to update hardcoded nodePort value in yaml file otherwise
        //   get error that nodePort is already in use even though dp api service was taken down
        .then(() => kubectl.applyManifest(files.path(DB_API_FILE)))
        //.then(() => kubectl.applyManifest(files.path(grafana_path)) 
    );
   },

  phaseOutK6() { 
    // need to get testId here; could read it from configMap file..
    const testId = "4"; // harcoding for now
    return (
      kubectl.deleteManifest(files.path(STATSITE_FILE))
        .then(() => kubectl.deleteConfigMap(testId))
        .then(() => eksctl.scaleLoadGenNodes(0))
        .then(() => kubectl.deleteManifest(files.path(K6_CR_FILE)))
    );
  },

  launchK6Test(testPath, numVus) {
    const testId = "4"; // hardcoding for now
    manifest.createK6Cr(testPath, numVus, testId); // will move this to below 
    const numNodes = manifest.parallelism(numVus);

    return (
      // get test id from node api request then call
      // manifest.createK6CR(testPath, numVus, string(testId));

      kubectl.applyManifest(files.path(STATSITE_FILE))
        .then(() => kubectl.createConfigMapWithName(testId, testPath))
        .then(() => eksctl.scaleLoadGenNodes(numNodes))
        .then(() => kubectl.applyManifest(files.path(K6_CR_FILE)))
    );
  },

  destroy() {
    eksctl.destroyCluster()
    // add logic for tearing down persistent volume store
  }
};

export default cluster;
