import fs from "fs";
import yaml from "js-yaml";
import { NUM_VUS_PER_POD, K6_CR_TEMPLATE, K6_CR_FINAL } from "./constants.js";
import { promisify } from "util";
import child_process from "child_process";
import fullPath from "./path.js";
import ora from "ora";
import cli from "./cli.js";
import eksctl from "./eksctl.js";

const exec = promisify(child_process.exec);
const k6OpDeployPath = fullPath('../k6-operator/deployment');

const kubectl = {
  deployK6Op(spinner) {
   spinner.text = "Deploying K6 operator...";
   return ( 
    exec(`cd ${k6OpDeployPath} && cd .. && make deploy`)
      .then(() => cli(spinner, 'Deployed k6 operator to cluster'))
    );
  },

  launchK6Test(testPath, numVus, configMapName, spinner) {
    this.createK6CustomResource(testPath, numVus, configMapName);
    const numNodes = this.parallelism(numVus);

    return (
      exec(`kubectl apply -f ${k6OpDeployPath}/statsite.yaml`)
        .then(() => exec(`kubectl create configmap ${configMapName} --from-file ${testPath}`))
        .then(() => eksctl.scaleLoadGenNodes(numNodes))
        .then(() => exec(`kubectl apply -f ${k6OpDeployPath}/${K6_CR_FINAL}`))
        .then(() => cli(spinner, "Starting k6 load test..."))
    );
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
    return Math.ceil(numVus / NUM_VUS_PER_POD);
  }
};

export default kubectl;
