import path from "path";
import { fileURLToPath } from 'url';
import { exec } from "child_process";
import fs from "fs";
import yaml from "js-yaml";
import { NUM_VUS_PER_JOB, K6_CR_TEMPLATE, K6_CR_FINAL } from "./constants.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let k6OperatorPath = path.join(__dirname, '../k6-operator');
k6OperatorPath = k6OperatorPath.replace(/ /g, '\\ ');

function createK6CustomResource(path, numVus, configMapName) {
  const name = testFileName(path);
  const cr = yaml.load(fs.readFileSync(`${k6OperatorPath}/e2e/${K6_CR_TEMPLATE}`, 'utf-8'));

  cr.spec.parallelism = parallelism(numVus);
  cr.spec.script.configMap.name = configMapName;
  cr.spec.script.configMap.file = testFileName(path);
  fs.writeFileSync(`${k6OperatorPath}/e2e/${K6_CR_FINAL}`, yaml.dump(cr));
}

function parallelism(numVus) {
  return numVus / NUM_VUS_PER_JOB;
}

function testFileName(path) {
  const pathItems = path.split('/');
  return pathItems[pathItems.length -1];
}

createK6CustomResource("./this/is/a/sample/test.js", 40000, "crocodiles");
