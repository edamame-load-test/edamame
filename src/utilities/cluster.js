import aws from "./aws.js";
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
  GEN_NODE_GROUP_FILE,
  AGG_NODE_GROUP_FILE,
  STATSITE_NODE_GRP,
  LOAD_AGG_NODE_TYPE,
  LOAD_GEN_NODE_GRP,
  LOAD_GEN_NODE_TYPE
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

  async create(zones) {
    const { stdout } = await eksctl.clusterDesc();
    if (!stdout.match(CLUSTER_NAME)) {
      // delete old edamame stacks if there was an AWS failure that didn't cleanly delete all old stacks
      await aws.deleteOldStacks();
      await eksctl.createCluster(zones);
    }
    
    await eksctl.createNodeGroup(GEN_NODE_GROUP_FILE, false);
    await eksctl.createNodeGroup(AGG_NODE_GROUP_FILE, false);
    await this.applyStatsiteManifests();
  },

  async configureEBSCreds() {
    const { stdout } = await aws.fetchOIDCs();
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
    await aws.newIamLBCPolicy();
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
    const crds = await kubectl.getCrds();
    const { stdout } = await kubectl.getPods();
    let dbApiExists = stdout.match("db-api");

    if (!dbApiExists) await kubectl.applyManifest(files.path(DB_API_FILE));
    if (!crds.stdout.match("k6")) await kubectl.deployK6Operator();
    if (!stdout.match("psql")) await this.applyPgManifests();
    if (!stdout.match("grafana")) await this.applyGrafanaManifests();
    if (!dbApiExists) await dbApi.logUrl();
  },

  async phaseOutK6() {
    const testId = manifest.latestK6TestId();

    await kubectl.deleteManifest(files.path(K6_CR_FILE));
    await kubectl.deleteManifest(files.path(STATSITE_FILE));
    await kubectl.deleteConfigMap(testId);
    await eksctl.scaleNodes(0, STATSITE_NODE_GRP);
    await eksctl.scaleNodes(0, LOAD_GEN_NODE_GRP);
    await loadGenerators.pollUntilGenNodesScaleDown();
    files.delete(K6_CR_FILE);
  },

  async provisionStatsiteNode() {
    await eksctl.scaleNodes(1, STATSITE_NODE_GRP);
    await loadGenerators.pollUntilLoadNodesReady(
      1, 
      LOAD_AGG_NODE_TYPE,
      STATSITE_NODE_GRP,
      "load aggregator node"
    );
  },

  async provisionGenNodes(numNodes) {
    await eksctl.scaleNodes(numNodes, LOAD_GEN_NODE_GRP);
    await loadGenerators.pollUntilLoadNodesReady(
      numNodes, 
      LOAD_GEN_NODE_TYPE,
      LOAD_GEN_NODE_GRP,
      "load generator nodes"
    );
  },

  async launchK6Test(testPath, testId) {
    await kubectl.applyManifest(files.path(STATSITE_FILE));
    await kubectl.createConfigMapWithName(testId, testPath);
    await kubectl.applyManifest(files.path(K6_CR_FILE));
  },

  async destroy() {
    await eksctl.destroyCluster();
    files.delete(GEN_NODE_GROUP_FILE);
    files.delete(AGG_NODE_GROUP_FILE);
    await aws.deleteOldIamLBCPolicy(iam.deleteAWSLbcPolArn());
    return aws.deleteEBSVolumes();
  }
};

export default cluster;
