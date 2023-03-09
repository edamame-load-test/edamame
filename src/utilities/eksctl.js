import child_process from "child_process";
import { CLUSTER_NAME } from "./constants.js";
import iam from "./iam.js";
import ora from "ora";
import fs from "fs";
import yaml from "js-yaml";
import fullPath from "./path.js";
import { promisify } from "util";
const exec = promisify(child_process.exec);
const k6OperatorPath = fullPath('../k6-operator/deployment');

const eksctl = {
  makeCluster() {
    const spinner = ora("Creating Edemame Cluster...").start();
    exec(`eksctl create cluster --name ${CLUSTER_NAME}`)
      .then(stdoObj => exec(`${iam.OIDC} && ${iam.listOIDCs}`))
      .then(stdoObj => {
        const exists = iam.OIDCexists(stdoObj.stdout)
        if (!exists) { exec(iam.createOIDC) }
      })
      .then(stdoObj => exec(iam.addIAMDriverRole))
      .then(stdoObj => exec(iam.fetchRoles))
      .then(stdoObj => {
        const nameRole = stdoObj.stdout.match(iam.ebsCsiDriverRegex);
        if (nameRole) {
          const role = nameRole[0].split("\t")[1];
          exec(iam.addCsiDriver(role));
        }
      })
      .then(stdoObj => spinner.succeed())
      .catch(error => {
        console.log(`Error creating Edemame cluster: ${error}`);
        spinner.fail();
      });
  },

  destroyCluster() {
    const spinner = ora("Tearing Down Edemame Cluster...").start();
    exec(`eksctl delete cluster --name ${CLUSTER_NAME}`)
      .then(stdoObj => spinner.succeed())
      .catch(error => {
        console.log(`error: ${error}`)
        spinner.fail();
      })
  }
};

export default eksctl;
