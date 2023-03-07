#!/usr/bin/env node

import { 
  deployEKSCluster, 
  destroyEKSCluster
} from "./commands/deploy.js"

const args = process.argv.slice(2);
const firstArg = args[0];

switch(firstArg) {
  case "deploy":
    deployEKSCluster();
    break;
  case "teardown":
    destroyEKSCluster();
    break;
  default:
    // placeholder
}


