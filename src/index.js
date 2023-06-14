#!/usr/bin/env node

import { init } from "./commands/init.js";
import { destroyEKSCluster } from "./commands/destroy.js";
import { runTest } from "./commands/runTest.js";
import { get } from "./commands/get.js";
import { updateTestName } from "./commands/updateTestName.js";
import { deleteTest } from "./commands/deleteTest.js";
import {
  portForwardGrafana,
  stopGrafana,
} from "./commands/portForwardGrafana.js";
import { stopTest } from "./commands/stopTest.js";
import { NUM_VUS_PER_POD } from "./constants/constants.js";
import { Command } from "commander";
import { startGui, stopGui } from "./commands/gui.js";

const program = new Command();

program
  .command("init")
  .option("-z, --zones <zones>", "List of one or more desired cluster availability zones specific to a user's preferred aws region")
  .description(
    "Create an EKS cluster and deploy Grafana, Postgres, & K6 Operator"
  )
  .action(init);

program
  .command("run")
  .requiredOption("-f, --file <file>", "File path of k6 load test script")
  .option("-n, --name <name>", "Name to associate with test")
  .option(
    "-v, --vus-per-pod <vus>",
    "Specify the maximum number of VUs per pod",
    NUM_VUS_PER_POD
  )
  .description("run the load test")
  .action(runTest);

program
  .command("get")
  .option("--all", "Get all information")
  .option("-n, --name <name>", "Name of specific test")
  .description("get information about all or one historical test(s)")
  .action(get);

program
  .command("delete <name>")
  .description("delete a test and associated metrics from the database")
  .action(deleteTest);

program
  .command("update")
  .requiredOption("-c, --current <current>", "Current test name")
  .requiredOption("-n, --new <new>", "New test name")
  .description("Update the name associated with a test")
  .action(updateTestName);

program
  .command("grafana")
  .option("--start", "Start Grafana")
  .option("--stop", "Stop Grafana")
  .description(
    "configure local access to grafana dashboard to analyze test metrics"
  )
  .action((options) => {
    if (options.start) {
      portForwardGrafana();
    } else if (options.stop) {
      stopGrafana();
    }
  });

program
  .command("stop")
  .description("stop a running test")
  .action(() => {
    stopTest();
  });

program
  .command("dashboard")
  .option("--start", "Start Dashboard")
  .option("--stop", "Stop Dashboard (leave grafana running)")
  .description("Spin up grafana, and the express app serving react")
  .action(async (options) => {
    if (options.start) {
      await portForwardGrafana(); // Spin up grafana
      startGui();
    } else if (options.stop) {
      stopGui();
    }
  });

program
  .command("teardown")
  .description("Delete the entire EKS cluster")
  .action(() => {
    destroyEKSCluster();
  });

program.parse(process.argv);
