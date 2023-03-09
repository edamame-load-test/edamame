import child_process from "child_process";
import { CLUSTER_NAME } from "./constants.js";
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
  makeCluster() {
    const spinner = ora("Creating Edamame Cluster...").start();
    return exec(`eksctl create cluster --name ${CLUSTER_NAME}`)
      .then(() => cli(spinner, "Created Edamame Cluster"))
      .catch(error => {
        cli(
          spinner, 
          `Error creating cluster: ${error}`, 
          false
        );
      });
  },

  configureEBSCreds() {
    const spinner = ora("Configuring EBS Credentials...").start();
    return exec(`${iam.OIDC} && ${iam.listOIDCs}`)
      .then(stdoObj => {
        console.log(stdoObj.stdout);
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
      .then(() => cli(spinner, "Configured EBS Credentials"))
      .catch(error => cli(spinner, `Error configuring EBS credentials ${error}`, false));
  },

  destroyCluster() {
    const spinner = ora("Tearing Down Edamame Cluster...").start();
    exec(`eksctl delete cluster --name ${CLUSTER_NAME}`)
      .then(() => cli(spinner, "Deleted Edamame Cluster"))
      .catch(error => {
        cli(
          spinner, 
          `Error deleting cluster: ${error}`, 
          false
        );
      })
  }
};

export default eksctl;
