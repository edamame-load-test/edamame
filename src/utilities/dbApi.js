import { 
  DB_API_NAME,
  DB_API_PORT,
  DB_API_REGEX
 } from "../constants/constants.js";
import kubectl from "./kubectl.js";
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const dbApi = {
  newTestId() {
    return (
      kubectl.getIps()
        .then(({stdout}) => {
          const url = this.findUrl(stdout);
          return exec(`curl -X POST ${url}/tests`);
        })
        .then(({stdout}) => {
          const testId = stdout.match('[0-9]{1,}');
          if (testId) {
            return testId[0];
          }
        })
    );
  },

  findUrl(stdout) {
    let url;
    const services = stdout.split("\n");

    for (let colIdx = 0; colIdx < services.length; colIdx++) {
      const serviceCols = services[colIdx];

      if (serviceCols.match(DB_API_NAME)) {
        const propRows = serviceCols.split(" ");

        for (let rowIdx = 0; rowIdx < propRows.length; rowIdx++) {
          const prop = propRows[rowIdx];
          if (prop && prop.match(DB_API_REGEX)) {
            return  prop + ":" + DB_API_PORT;
          }
        }
      }
    }
  },

  getTestIds() {
    return (
      kubectl.getIps()
        .then(({stdout}) => {
          const url = this.findUrl(stdout);
          return exec(`curl -X GET ${url}/tests`);
        })
    );
  }
};

export default dbApi;


