import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import yaml from "js-yaml";
import ora from "ora";
import child_process from "child_process";
import { promisify } from "util";
import fullPath from "./path.js";
const exec = promisify(child_process.exec);

const cdkPath = fullPath(import.meta.url, '../cdk');
const k6OperatorPath = fullPath(import.meta.url, '../k6-operator/deployment');

const cdkApp = {
  deploy() {
    const spinner = ora("Creating Edemame Cluster...").start();
    exec(`cd ${cdkPath} && cdk synth && cdk bootstrap && cdk deploy --require-approval never`).then(stdoObj => {
      // stdout info includes cluster name/other cluster info if it's successfully created
      // this ensures we have the info to connect kubectl to the right cluster
      fs.writeFileSync(`${k6OperatorPath}/yaml_deploy_stdout`, yaml.dump(stdoObj));
      spinner.succeed();
    }).catch(error => {
      spinner.fail();
      console.log(`error creating cluster: ${error}`);
    });
  },
  destroy() {
    const spinner = ora("Deleting Edemame Cluster...");
    exec(`cd ${cdkPath} && cdk destroy`).then(stdoObj => {
      spinner.succeed();
    }).catch(error => {
      spinner.fail();
      console.log(`error deleting cluster: ${error}`);
    });
  }
};


export default cdkApp;
