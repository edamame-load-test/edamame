import {
  K6_CR_TEMPLATE,
  K6_CR_FILE,
  CLUSTER_NAME,
  GRAF_JSON_DBS,
  DB_API_INGRESS,
  DB_API_ING_TEMPLATE,
  LOAD_GEN_NODE_GRP
} from "../constants/constants.js";
import aws from "./aws.js";
import files from "./files.js";
import kubectl from "./kubectl.js";
import eksctl from "./eksctl.js";

const manifest = {
  createDbApiIngress(userIp) {
    const data = files.readYAML(DB_API_ING_TEMPLATE);
    const cidr = `${userIp}/32`;
    data.metadata.annotations["alb.ingress.kubernetes.io/inbound-cidrs"] = cidr;

    files.writeYAML(DB_API_INGRESS, data);
  },

  createK6Cr(path, testId, numNodes) {
    // change to kustomize overlay chain
    const k6CrData = files.readYAML(K6_CR_TEMPLATE);
    const envObjs = k6CrData.spec.runner.env;

    k6CrData.spec.parallelism = numNodes;
    k6CrData.spec.script.configMap.name = String(testId);
    k6CrData.spec.script.configMap.file = files.parseNameFromPath(path);
    envObjs.forEach((obj) => {
      if (obj.name === "K6_STATSD_NAMESPACE") {
        obj.value = `${testId}.`;
      }
    });

    if (!files.exists(files.path("/load_test_crds"))) {
      files.makeDir("/load_test_crds");
    }

    files.writeYAML(K6_CR_FILE, k6CrData);
  },

  async createNodeGroupCr(type, finalFile, template, useBackUpNodeType = false) {
    const nodeGroupData = files.readYAML(template);
    nodeGroupData.metadata.region = await eksctl.getRegion();

    if (useBackUpNodeType) {
      if (type === LOAD_GEN_NODE_GRP) {
        nodeGroupData.nodeGroups[0].instanceType = BACKUP_NODE_TYPE;
      } else {
        nodeGroupData.managedNodeGroups[0].instanceType = BACKUP_NODE_TYPE;
      }
    }

    if (!files.exists(files.path("/load_test_crds"))) {
      files.makeDir("/load_test_crds");
    }
    files.writeYAML(finalFile, nodeGroupData);
  },

  desiredNumLoadGenNodes() {
    const k6CrData = files.readYAML(K6_CR_FILE);
    return k6CrData.spec.parallelism;
  },

  numVus(path) {
    let numVus = 0;

    if (files.exists(path)) {
      let test = files.read(path);
      test = test.split("\n");

      test.forEach((line) => {
        let vus = line.match("vus: [0-9]{1,}");
        let target = line.match("target: [0-9]{1,}");
        let max = line.match("maxVUs: [0-9]{1,}");

        if (vus) {
          numVus = this.maxNumVus(numVus, vus[0]);
        } else if (target) {
          numVus = this.maxNumVus(numVus, target[0]);
        } else if (max) {
          numVus = this.maxNumVus(numVus, max[0]);
        }
      });
    }
    return numVus;
  },

  maxNumVus(currNumVus, newNumVus) {
    newNumVus = this.findNumber(newNumVus);
    return newNumVus > currNumVus ? newNumVus : currNumVus;
  },

  findNumber(string) {
    return Number(string.match("[0-9]{1,}")[0]);
  },

  latestK6TestId() {
    const data = files.readYAML(K6_CR_FILE);
    return data.spec.script.configMap.name;
  },

  async setPgDbApiGrafCredentials(pw) {
    let secretData = `postgres-username=${CLUSTER_NAME}\npostgres-password=${pw}\n`;
    let awsData = await aws.currentCLICredentials();
    secretData += `aws-region=${awsData.region}\naws-account-id=${awsData.accountId}\n`;
    secretData += `aws-access-key-id=${awsData.accessKey}\naws-secret-access-key=${awsData.secretKey}\n`;
    files.write("postgres.env", secretData);
    await kubectl.createSecret();
  },

  forEachGrafJsonDB(callback) {
    const dirPath = files.path(`/${GRAF_JSON_DBS}`);
    const names = files.fileNames(dirPath);
    names.forEach(async (name) => {
      if (name.match(".json")) {
        const nameNoExt = name.replace(".json", "").replaceAll("_", "-");
        await callback(nameNoExt, `${dirPath}/${name}`);
      }
    });
  },

  base64(value) {
    return Buffer.from(value, "utf8").toString("base64");
  },

  parallelism(numVus, vusPerPod) {
    return Math.ceil(numVus / vusPerPod);
  },
};

export default manifest;