import iam from "./iam.js";
import dbApi from "./dbApi.js";
import files from "./files.js";
import eksctl from "./eksctl.js";
import kubectl from "./kubectl.js";
import manifest from "./manifest.js";

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
  STATSITE_CM,
  STATSITE_CM_FOLDER,
  PG_CM_FILE,
  PG_SS_FILE,
  DB_API_FILE,
  GRAF_DS_FILE,
  GRAF_DB_FILE,
  STATSITE_NODE_GRP_FILE
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
      .then(() => eksctl.createLoadGenGrp())
      .then(() => eksctl.createStatsiteGrp())
      .then(() => this.applyStatsiteManifests())
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
    return kubectl.configMapExists(PG_CM)
      .then((exists) => {
        if (!exists) {
          return kubectl.createConfigMap(files.path(PG_CM_FILE));
        }
      })
      .then(() => kubectl.applyManifest(files.path(PG_SS_FILE)))
      .then(() => new Promise(res => setTimeout(res, 10000)))
    // setting a 10s delay on return above to see if it fixes issue with timing
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

  applyStatsiteManifests() {
    return kubectl.configMapExists(STATSITE_CM)
      .then((exists) => {
        if (!exists) {
          return kubectl.createConfigMapWithName(STATSITE_CM, files.path(STATSITE_CM_FOLDER));
        }
      })
  },

  deployServersK6Op() {
    return kubectl
      .deployK6Operator()
      .then(() => this.applyPgManifests()) // added 10 s delay here
      .then(() => this.applyGrafanaManifests())
      .then(() => kubectl.applyManifest(files.path(DB_API_FILE)))
  },

  phaseOutK6() {
    const testId = manifest.latestK6TestId();
    return kubectl.deleteManifest(files.path(K6_CR_FILE))
      .then(() => kubectl.deleteManifest(files.path(STATSITE_FILE)))
      .then(() => kubectl.deleteConfigMap(testId))
      .then(() => eksctl.scaleStatsiteNodes(0))
      .then(() => eksctl.scaleLoadGenNodes(0))
      .then(() => files.delete(K6_CR_FILE));
  },

  launchK6Test(testPath, testId, numNodes) {
    manifest.createK6Cr(testPath, testId, numNodes);

    return (
      kubectl.createConfigMapWithName(testId, testPath)
        .then(() => kubectl.applyManifest(files.path(STATSITE_FILE)))
        .then(() => kubectl.applyManifest(files.path(K6_CR_FILE)))
        .then(() => eksctl.scaleStatsiteNodes(1))
        .then(() => eksctl.scaleLoadGenNodes(numNodes))
    );
  },

  async destroy() {
    await eksctl.destroyCluster();
    files.delete(STATSITE_NODE_GRP_FILE);
    return eksctl.deleteEBSVolumes();
  },
};

export default cluster;
