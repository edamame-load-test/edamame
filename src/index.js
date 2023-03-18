#!/usr/bin/env node

import { init } from "./commands/init.js";
import { destroyEKSCluster } from "./commands/destroy.js";
import { runTest } from "./commands/runTest.js";
import { getTestIds } from "./commands/getTestIds.js";
import { portForwardGrafana } from "./commands/portForwardGrafana.js";
import { stopTest } from "./commands/stopTest.js"
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
  .command("run <file>")
  .description("run the load test")
  .action((file) => {
    runTest(file);
  });

program
  .command("get")
  .description("get a list of all available test IDs")
  .action(() => {
    getTestIds();
  });

program
  .command("grafana")
  .description("configure local access to grafana dashboard to analyze test metrics")
  .action(() => {
    portForwardGrafana();
  });

program
  .command("stop")
  .description("get a list of all available test IDs")
  .action(() => {
    stopTest();
  });

program
  .command("teardown")
  .description("Delete the entire EKS cluster")
  .action(() => {
    destroyEKSCluster();
  });

program.parse(process.argv);

