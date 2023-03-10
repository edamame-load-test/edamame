import fs from "fs";
import yaml from "js-yaml";
import {
  NUM_VUS_PER_POD, 
  K6_CR_TEMPLATE, 
  K6_CR_FINAL 
} from "./constants.js";
import fullPath from "./path.js";
const k6OpDeployPath = fullPath('../k6-operator/deployment');

const cr = {
  createK6(path, numVus, configMapName) {
    const k6Crd = yaml.load(fs.readFileSync(`${k6OpDeployPath}/${K6_CR_TEMPLATE}`, 'utf-8'));
    k6Crd.spec.parallelism = this.parallelism(numVus);
    k6Crd.spec.script.configMap.name = configMapName;
    k6Crd.spec.script.configMap.file = this.testFileName(path);
    fs.writeFileSync(`${k6OpDeployPath}/${K6_CR_FINAL}`, yaml.dump(k6Crd));
  },
  
  testFileName(path) {
    const pathItems = path.split('/');
    return pathItems[pathItems.length -1];
  },

  parallelism(numVus) {
    return Math.ceil(numVus / NUM_VUS_PER_POD);
  }
};

export default cr;
