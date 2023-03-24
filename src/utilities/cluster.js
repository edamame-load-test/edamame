import iam from "./iam.js";
import dbApi from "./dbApi.js";
import helm from "./helm.js";
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
  K6_CR_FILE,
  STATSITE_FILE,
  STATSITE_CM,
  STATSITE_CM_FOLDER,
  PG_CM_FILE,
  PG_SS_FILE,
  DB_API_FILE,
  GRAF_DS_FILE,
  GRAF_DB_FILE,
  DB_API_INGRESS
  STATSITE_NODE_GRP_FILE
} from "../constants/constants.js";
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const cluster = {
  checkForAllInstallations() {
    return (
      helm.existsOrError()
        .then(() => kubectl.existsOrError())
        .then(() => eksctl.existsOrError())
        .then(() => {
          return this.checkInstallation("make --version",
            "Make", 
            "https://www.gnu.org/software/make/#download"
          );
        })
        .then(() => {
          return this.checkInstallation("aws --version", 
            "AWS Cli", 
            "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
          );
        })
        .then(() => this.checkInstallation("go version", "Go", "https://go.dev/doc/install"))
    );
  },

  checkInstallation(command, name, link) {
    return (
      exec(command)
        .then(({stdout}) => {
          if (!stdout) {
            const msg = `${name} isn't installed. Please install it.` +
             `Instructions can be found at: ${link} `;
            throw new Error(msg);
          }
        })
    );
  },

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
    return (
      eksctl
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
        })
    );
  },

  setupAWSLoadBalancerController() {
    return (
      eksctl
        .createIamLBCPolicy(iam.existingEdamameAWSLbcPolArn())
        .then(({stdout}) => {
          const policyArn = iam.lbcPolicyArn(stdout);
          return eksctl.createIamRoleLBCPol(policyArn);
        })
        .then(() => kubectl.appplyAwsLbcCrd())
        .then(() => helm.addEKSRepo())
        .then(() => helm.upgradeAWSLBC())
        .then(() => kubectl.deployHelmChartRepo())
        .then(() => eksctl.localIp())
        .then(({stdout}) => manifest.createDbApiIngress(stdout))
        .then(() => kubectl.applyManifest(files.path(DB_API_INGRESS)))
    );
  },

  applyPgManifests() {
    return (
      kubectl.configMapExists(PG_CM)
        .then((exists) => {
          if (!exists) {
            return kubectl.createConfigMap(files.path(PG_CM_FILE));
          }
        })
        .then(() => kubectl.applyManifest(files.path(PG_SS_FILE)))
        .then(() => new Promise(res => setTimeout(res, 10000)))
      // setting a 10s delay on return above to see if it fixes issue with timing
    );
  },

  applyGrafanaManifests() {
    return (
      kubectl.configMapExists(GRAF_DS).then((exists) => {
        if (!exists) {
          return kubectl
            .createConfigMapWithName(GRAF_DS, files.path(GRAF_DS_FILE))
            .then(() =>
              manifest.forEachGrafJsonDB(kubectl.createConfigMapWithName)
            )
            .then(() =>
              kubectl.createConfigMapWithName(GRAF_DBS, files.path(GRAF_DB_FILE))
            )
            .then(() => kubectl.applyManifest(files.path(GRAF)))
        }
      })
    );
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
    return (
      kubectl
        .applyManifest(files.path(DB_API_FILE))
        .then(() => kubectl.deployK6Operator())
        .then(() => this.applyPgManifests()) // added 10 s delay here
        .then(() => this.applyGrafanaManifests())
        .then(() => dbApi.logUrl())
    );
  },

  phaseOutK6() {
    const testId = manifest.latestK6TestId();
    return (
      kubectl.deleteManifest(files.path(K6_CR_FILE))
      .then(() => kubectl.deleteManifest(files.path(STATSITE_FILE)))
      .then(() => kubectl.deleteConfigMap(testId))
      .then(() => eksctl.scaleStatsiteNodes(0))
      .then(() => eksctl.scaleLoadGenNodes(0))
      .then(() => files.delete(K6_CR_FILE))
    );
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
