#!/usr/bin/env node

import { deployEKSCluster } from "./commands/deploy.js"
import { destroyEKSCluster } from "./commands/destroy.js"
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
    // assumes test is run like so, with the relative filepath being passed in after --file:
    //  edemame run-test --file ./deployment/test.js --vus 40000 --name medium-test
    const filePath = flagValue("--file");
    const numVus = flagValue("--vus");
    const configMapName = flagValue("--name");
    runTest(filePath, numVus, configMapName);
    break;
  case "teardown":
    destroyEKSCluster();
    break;
  case "destroy-all":
    break;
  default:
    // placeholder
}


