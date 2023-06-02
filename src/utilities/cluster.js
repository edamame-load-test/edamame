import iam from "./iam.js";
import dbApi from "./dbApi.js";
import helm from "./helm.js";
import files from "./files.js";
import eksctl from "./eksctl.js";
import kubectl from "./kubectl.js";
import manifest from "./manifest.js";
import loadGenerators from "./loadGenerators.js";
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
  DB_API_INGRESS,
  NODE_GROUPS_FILE
} from "../constants/constants.js";
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const cluster = {
  async checkForAllInstallations() {
    await helm.existsOrError();
    await kubectl.existsOrError();
    await eksctl.existsOrError();
    await this.checkInstallation(
      "make --version",
      "Make",
      "https://www.gnu.org/software/make/#download"
    );
    await this.checkInstallation(
      "aws --version",
      "AWS Cli",
      "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    );

    await this.checkInstallation(
      "go version", 
      "Go", 
      "https://go.dev/doc/install"
    );
  },

  async checkInstallation(command, name, link) {
    try {
      await exec(command);
    } catch {
      const msg = `${name} isn't installed. Please install it.` +
      `Instructions can be found at: ${link} `;
      throw new Error(msg);
    }
  },

  async create() {
    const { stdout } = await eksctl.clusterDesc();
    if (!stdout.match(CLUSTER_NAME)) {
      await eksctl.createCluster();
    }

    await eksctl.createNodeGroups();
    await this.applyStatsiteManifests();
  },

  async configureEBSCreds() {
    const { stdout } = await eksctl.fetchOIDCs();
    if (!iam.OIDCexists(stdout)) {
      await eksctl.createOIDC();
    }
    await eksctl.addIAMDriverRole();
    let response = await eksctl.fetchIamRoles()

    const role = iam.ebsRole(response.stdout);
    if (role) {
      await eksctl.addCsiDriver(role);
    }
  },

  async setupAWSLoadBalancerController() {
    await eksctl.newIamLBCPolicy();
    await helm.addEKSRepo();
    await kubectl.applyAwsLbcCrd();
    await helm.installAWSLBC();
    let response = await eksctl.localIp();
    manifest.createDbApiIngress(response.stdout);
    
    await new Promise(res => setTimeout(res, 15000));
    await kubectl.applyManifest(files.path(DB_API_INGRESS));
  },

  async applyPgManifests() {
    let exists = await kubectl.configMapExists(PG_CM);

    if (!exists) {
      await kubectl.createConfigMap(files.path(PG_CM_FILE));
    }
    await kubectl.applyManifest(files.path(PG_SS_FILE));
    return new Promise(res => setTimeout(res, 10000));
  },

  async applyGrafanaManifests() {
    let exists = await kubectl.configMapExists(GRAF_DS);
    if (!exists) {
      await kubectl.createConfigMapWithName(
        GRAF_DS, 
        files.path(GRAF_DS_FILE)
      );
      manifest.forEachGrafJsonDB(kubectl.createConfigMapWithName);
      await kubectl.createConfigMapWithName(
        GRAF_DBS, 
        files.path(GRAF_DB_FILE)
      );
      await kubectl.applyManifest(files.path(GRAF));
    }
  },

  async applyStatsiteManifests() {
    let exists = await kubectl.configMapExists(STATSITE_CM);
    if (!exists) {
      return kubectl.createConfigMapWithName(
        STATSITE_CM, 
        files.path(STATSITE_CM_FOLDER)
      );
    }
  },

  async deployServersK6Op() {
    await kubectl.applyManifest(files.path(DB_API_FILE));
    await kubectl.deployK6Operator();
    await this.applyPgManifests();
    await this.applyGrafanaManifests();
    await dbApi.logUrl();
  },

  async phaseOutK6() {
    const testId = manifest.latestK6TestId();

    await kubectl.deleteManifest(files.path(K6_CR_FILE));
    await kubectl.deleteManifest(files.path(STATSITE_FILE));
    await kubectl.deleteConfigMap(testId);
    await eksctl.scaleStatsiteNodes(0);
    await eksctl.scaleLoadGenNodes(0);
    await loadGenerators.pollUntilGenNodesScaledToZero();
    files.delete(K6_CR_FILE);
  },

  async provisionStatsiteNode() {
    await eksctl.scaleStatsiteNodes(1);
  },

  async provisionGenNodes(numNodes) {
    await eksctl.scaleLoadGenNodes(numNodes);
    await loadGenerators.pollUntilGenNodesReady(numNodes);
  },

  async launchK6Test(testPath, testId, numNodes) {
    manifest.createK6Cr(testPath, testId, numNodes);

    await kubectl.applyManifest(files.path(STATSITE_FILE));
    await kubectl.createConfigMapWithName(testId, testPath);
    await kubectl.applyManifest(files.path(K6_CR_FILE));
  },

  async destroy() {
    await eksctl.destroyCluster();
    files.delete(NODE_GROUPS_FILE);
    await eksctl.deleteOldIamLBCPolicy(iam.deleteAWSLbcPolArn());
    return eksctl.deleteEBSVolumes();
  }
};

export default cluster;
