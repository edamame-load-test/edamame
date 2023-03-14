#!/usr/bin/env node

import { init } from "./commands/init.js";
import { destroyEKSCluster } from "./commands/destroy.js";
import { runTest } from "./commands/runTest.js";
import { getTestIds } from "./commands/getTestIds.js";
import { Command } from "commander";
const program = new Command();

program
  .command("init")
  .description(
    "Create an EKS cluster and deploy Grafana, Postgres, & K6 Operator"
  )
  .action(() => {
    init();
  });

program
  .command("run")
  .description("run the load test")
  .requiredOption("-f, --file <file>", "path to the test file")
  // .option("-n, --name <name>", "name to associate with the test")
  .action((options) => {
    const filePath = options.file;
    runTest(filePath);
  });

program
  .command("get")
  .description("get a list of all available test IDs")
  .action(() => {
    getTestIds();
  });

program
  .command("teardown")
  .description("Delete the entire EKS cluster")
  .action(() => {
    destroyEKSCluster();
  });

program.parse(process.argv);
