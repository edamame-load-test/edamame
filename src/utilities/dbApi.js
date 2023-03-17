import { 
  DB_API_SERVICE,
  DB_API_PORT,
  PORT_FORWARD_DELAY
 } from "../constants/constants.js";
import kubectl from "./kubectl.js";
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const dbApi = {
  newTestId() {
    kubectl
      .exactPodName("db-api")
      .then(podName => {
        kubectl.tempPortForward(podName, DB_API_PORT, DB_API_PORT);
      });
      
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.curlRequest("-X POST")
          .then(({stdout}) => {
            kubectl.endPortForward("db-api");
            const testId = stdout.match('[0-9]{1,}');
            if (testId) {
              resolve(testId[0]);
            }
          })
      }, PORT_FORWARD_DELAY)
    });
  },

  curlRequest(http_method="", path="tests") {
    return exec(`curl ${http_method} http://localhost:${DB_API_PORT}/${path}`);
  },

  getTestIds() {
    kubectl
      .exactPodName("db-api")
      .then(podName => {
        kubectl.tempPortForward(podName, DB_API_PORT, DB_API_PORT);
      });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return (
          this.curlRequest("")
            .then(({stdout}) => {
              kubectl.endPortForward("db-api");
              resolve(stdout);
            })
        );
      }, PORT_FORWARD_DELAY)
    });
  }
};

export default dbApi;
