import child_process from "child_process";
import { CLUSTER_NAME } from "./constants.js";
import ora from "ora";
import fs from "fs";
import yaml from "js-yaml";
import fullPath from "./path.js";
import { promisify } from "util";
const exec = promisify(child_process.exec);
const k6OperatorPath = fullPath(import.meta.url, '../k6-operator/deployment');

const eksctl = {
  makeCluster() {
    const spinner = ora("Creating Edemame Cluster...").start();
    exec(`eksctl create cluster --name ${CLUSTER_NAME}`).then(stdoObj => {
      spinner.succeed();
      fs.writeFileSync(`${k6OperatorPath}/cluster_deploy_stdout.yaml`, yaml.dump(stdoObj));
    }).catch(error => {
      spinner.fail();
    });
  }
};

export default eksctl;
