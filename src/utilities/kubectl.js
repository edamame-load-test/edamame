import fs from "fs";
import yaml from "js-yaml";
import { NUM_VUS_PER_JOB, K6_CR_TEMPLATE, K6_CR_FINAL } from "./constants.js";
import { promisify } from "util";
import child_process from "child_process";
import fullPath from "./path.js";
import ora from "ora";

const exec = promisify(child_process.exec);
const k6OpDeployPath = fullPath('../k6-operator/deployment');

const kubectl = {
  launchK6Test(testPath, numVus, configMapName) {
    this.createK6CustomResource(testPath, numVus, configMapName);
    const spinner = ora("Distributing K6 load test...").start();

    // may move some of these exec commands elsewhere to chain them during cluster creation
    exec(`cd ${k6OpDeployPath} && cd .. && make deploy`)
      .then((stdoObj) => exec(`kubectl apply -f ${k6OpDeployPath}/statsite.yaml`))
      .then((stdoObj) => exec(`kubectl create configmap ${configMapName} --from-file ${testPath}`))
      .then((stdoObj) => exec(`kubectl apply -f ${k6OpDeployPath}/${K6_CR_FINAL}`))
      .then((stdoObj) => {
        spinner.text = "Starting k6 load test";
        spinner.succeed()
      })
      .catch((error) => {
        console.log(`Error during distributed k6 test deployment: ${error}`);
        spinner.fail();
      });
  },

  createK6CustomResource(path, numVus, configMapName) {
    const cr = yaml.load(fs.readFileSync(`${k6OpDeployPath}/${K6_CR_TEMPLATE}`, 'utf-8'));
    cr.spec.parallelism = this.parallelism(numVus);
    cr.spec.script.configMap.name = configMapName;
    cr.spec.script.configMap.file = this.testFileName(path);
    fs.writeFileSync(`${k6OpDeployPath}/${K6_CR_FINAL}`, yaml.dump(cr));
  },
  
  testFileName(path) {
    const pathItems = path.split('/');
    return pathItems[pathItems.length -1];
  },

  parallelism(numVus) {
    return numVus / NUM_VUS_PER_JOB;
  }
};

export default kubectl;
