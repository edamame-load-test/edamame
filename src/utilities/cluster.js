import iam from "./iam.js";
import dbApi from "./dbApi.js";
import files from "./files.js";
import eksctl from "./eksctl.js";
import kubectl from "./kubectl.js";
import manifest from "./manifest.js";
import grafana from "./grafana.js";
import {
  CLUSTER_NAME,
  PG_CM,
  GRAF,
  GRAF_DS,
  GRAF_DBS,
  GRAF_PORT,
  K6_CR_FILE,
  STATSITE_FILE,
  PG_SECRET_FILE,
  PG_CM_FILE,
  PG_SS_FILE,
  DB_API_FILE,
  GRAF_DS_FILE,
  GRAF_DB_FILE,
} from "../constants/constants.js";

const cluster = {
  create() {
    return eksctl
      .clusterDesc()
      .then(({ stdout }) => {
        if (!stdout.match(CLUSTER_NAME)) {
          return eksctl.createCluster();
        }
      })
      .then(() => eksctl.createLoadGenGrp());
  },

  configureEBSCreds() {
    return eksctl
      .fetchOIDCs()
      .then(({ stdout }) => {
        if (!iam.OIDCexists(stdout)) {
          return eksctl.createOIDC();
        }
      })
      .then(() => eksctl.addIAMDriverRole())
      .then(() => eksctl.fetchIamRoles())
      .then(({ stdout }) => {
        const role = iam.ebsRole(stdout);
        if (role) {
          return eksctl.addCsiDriver(role);
        }
      });
  },

  applyPgManifests() {
    return kubectl
      .applyManifest(files.path(PG_SECRET_FILE))
      .then(() => kubectl.configMapExists(PG_CM))
      .then((exists) => {
        if (!exists) {
          return kubectl.createConfigMap(files.path(PG_CM_FILE));
        }
      })
      .then(() => kubectl.applyManifest(files.path(PG_SS_FILE)));
  },

  applyGrafanaManifests() {
    return kubectl.configMapExists(GRAF_DS).then((exists) => {
      if (!exists) {
        return kubectl
          .createConfigMapWithName(GRAF_DS, files.path(GRAF_DS_FILE))
          .then(() =>
            manifest.forEachGrafJsonDB(kubectl.createConfigMapWithName)
          )
          .then(() =>
            kubectl.createConfigMapWithName(GRAF_DBS, files.path(GRAF_DB_FILE))
          )
          .then(() => kubectl.applyManifest(files.path(GRAF)));
      }
    });
  },

  deployServersK6Op() {
    return kubectl
      .deployK6Operator()
      .then(() => this.applyPgManifests())
      .then(() => this.applyGrafanaManifests())
      .then(() => kubectl.applyManifest(files.path(DB_API_FILE)))
      .then(() => grafana.getExternalIp());
  },

  phaseOutK6() {
    const testId = manifest.latestK6TestId();
    return kubectl
      .deleteManifest(files.path(STATSITE_FILE))
      .then(() => kubectl.deleteConfigMap(testId))
      .then(() => eksctl.scaleLoadGenNodes(0))
      .then(() => kubectl.deleteManifest(files.path(K6_CR_FILE)));
  },

  launchK6Test(testPath, numVus) {
    return dbApi
      .newTestId()
      .then((testId) => {
        manifest.createK6Cr(testPath, numVus, testId);
        return kubectl.createConfigMapWithName(testId, testPath);
      })
      .then(() => kubectl.applyManifest(files.path(STATSITE_FILE)))
      .then(() => eksctl.scaleLoadGenNodes(manifest.parallelism(numVus)))
      .then(() => kubectl.applyManifest(files.path(K6_CR_FILE)));
  },

  async destroy() {
    await eksctl.destroyCluster();
    return eksctl.deleteEBSVolumes();
    /*return (
      //kubectl.deletePv('pv', need_to_get_and_parse_name_first) 
        //.then(() => eksctl.destroyCluster())
        // any additional logic needed for deleting EBS?
    );*/
  },
};

export default cluster;
