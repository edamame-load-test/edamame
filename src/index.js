#!/usr/bin/env node

import { 
  deployEKSCluster
} from "./commands/deploy.js"
import { runTest } from "./commands/runTest.js"

const args = process.argv.slice(2);
const firstArg = args[0];

function flagValue(flag) {
  return args[args.indexOf(flag) + 1];
}

switch(firstArg) {
  case "deploy":
    deployEKSCluster();
    break;
  case "run-test":
    // this assumes a test would be run like so:
    //   edemame run-test --file /this/is/the/full/filepath/test.js --vus 40000 --name medium-test
    const filePath = flagValue("--file");
    const numVus = flagValue("--vus");
    const configMapName = flagValue("--name");
    runTest(filePath, numVus, configMapName);
    break;
  case "destroy-all":
    destroyEKSCluster();
    break;
  default:
    // placeholder
}


