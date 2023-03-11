import iam from "./iam.js";
import dbApi from "./dbApi.js";
import files from "./files.js";
import eksctl from "./eksctl.js";
import kubectl from "./kubectl.js";
import manifest from "./manifest.js";
import { 
  CLUSTER_NAME,
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
      eksctl.clusterDesc()
        .then(({stdout}) => {
          if (!stdout.match(CLUSTER_NAME)) {
            return eksctl.createCluster();
          }
        })
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
    const testId = manifest.latestK6TestId();
    return (
      kubectl.deleteManifest(files.path(STATSITE_FILE))
        .then(() => kubectl.deleteConfigMap(testId))
        .then(() => eksctl.scaleLoadGenNodes(0))
        .then(() => kubectl.deleteManifest(files.path(K6_CR_FILE)))
    );
  },

  launchK6Test(testPath, numVus) {
    return (
      dbApi.newTestId()
        .then((testId) => {
          manifest.createK6Cr(testPath, numVus, testId);
          return kubectl.createConfigMapWithName(testId, testPath);
        })
        .then(() => kubectl.applyManifest(files.path(STATSITE_FILE)))
        .then(() => eksctl.scaleLoadGenNodes(manifest.parallelism(numVus)))
        .then(() => kubectl.applyManifest(files.path(K6_CR_FILE)))
    );
  },

  destroy() {
    return eksctl.destroyCluster();
    /*return (
      //kubectl.deletePv('pv', need_to_get_and_parse_name_first) 
        //.then(() => eksctl.destroyCluster())
        // any additional logic needed for deleting EBS?
    );*/
  }
};

export default cluster;
