#!/usr/bin/env node

import { init } from "./commands/init.js"
import { destroyEKSCluster } from "./commands/destroy.js"
import { runTest } from "./commands/runTest.js"

const args = process.argv.slice(2);
const firstArg = args[0];

function flagValue(flag) {
  return args[args.indexOf(flag) + 1];
}

switch(firstArg) {
  case "init":
    init();
    break;
  case "run-test":
    // assumes test is run like so, with the relative filepath being passed in after --file:
    //  edamame run-test --file ./deployment/test.js --vus 40000
    const filePath = flagValue("--file");
    const numVus = flagValue("--vus");
    runTest(filePath, numVus);
    break;
  case "teardown":
    destroyEKSCluster();
    break;
  case "destroy-all":
    break;
  default:
    // placeholder
}


