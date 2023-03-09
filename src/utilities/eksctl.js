import child_process from "child_process";
import { CLUSTER_NAME, LOAD_GEN_NODE_GRP } from "./constants.js";
import iam from "./iam.js";
import ora from "ora";
import fs from "fs";
import yaml from "js-yaml";
import fullPath from "./path.js";
import { promisify } from "util";
import cli from "./cli.js";
const exec = promisify(child_process.exec);
const k6OperatorPath = fullPath('../k6-operator/deployment');

const eksctl = {
  makeCluster(spinner) {
    return (
      exec(`eksctl create cluster --name ${CLUSTER_NAME}`)
        .then(() => cli(spinner, "Created Edamame cluster"))
        .then(() => this.createLoadGenGrp())
        .then(() => cli(spinner, "Configured load generation node group on cluster"))
    );
  },

  createLoadGenGrp() {
    return exec(
      `eksctl create nodegroup --cluster=${CLUSTER_NAME} `+ 
      `--name=${LOAD_GEN_NODE_GRP} --node-type=t3.small ` +
      `--nodes=0 --nodes-min=0 --nodes-max=100 `
    );
  },

  scaleLoadGenNodes(numNodes) {
    return exec(
      `eksctl scale nodegroup --cluster=${CLUSTER_NAME} ` +
      `--nodes=${numNodes} ${LOAD_GEN_NODE_GRP}`
    );
  },

  configureEBSCreds(spinner) {
    spinner.text = "Configuring EBS Credentials...";
    return exec(`${iam.OIDC} && ${iam.listOIDCs}`)
      .then(stdoObj => {
        const exists = iam.OIDCexists(stdoObj.stdout);
        if (!exists) { 
          return exec(iam.createOIDC);
        }
      })
      .then(() => exec(iam.addIAMDriverRole))
      .then(() => exec(iam.fetchRoles))
      .then(stdoObj => {
        const nameRole = stdoObj.stdout.match(iam.ebsCsiDriverRegex);
        if (nameRole) {
          const role = nameRole[0].split("\t")[1];
          exec(iam.addCsiDriver(role));
        }
      })
      .then(() => cli(spinner, "Configured EBS Credentials"));
  },

  destroyCluster() {
    const spinner = ora("Tearing Down Edamame Cluster...").start();
    exec(`eksctl delete cluster --name ${CLUSTER_NAME}`)
      .then(() => cli(spinner, "Deleted Edamame Cluster", "success"))
      .catch(error => {
        cli(
          spinner, 
          `Error deleting cluster: ${error}`, 
          "fail"
        );
      })
  }
};

export default eksctl;
