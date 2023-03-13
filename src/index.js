#!/usr/bin/env node

import { init } from "./commands/init.js"
import { destroyEKSCluster } from "./commands/destroy.js"
import { runTest } from "./commands/runTest.js"
import { getTestIds } from "./commands/getTestIds.js";

const args = process.argv.slice(2);
const firstArg = args[0];

function flagValue(flag) {
  return args[args.indexOf(flag) + 1];
}

switch(firstArg) {
  case "init":
    init();
    break;
  case "run":
    // assumes test is run like so, with the relative filepath being passed in after --file:
    //  edamame run test --file ./deployment/test.js --vus 40000
    const filePath = flagValue("--file");
    // later: add back (--name) flag to let users associate testId with name of their choice
    //   then when want to view a test 
    runTest(filePath);
    break;
  case "get":
    getTestIds();
    break;
  case "teardown":
    destroyEKSCluster();
    break;
  default:
    // placeholder
}


