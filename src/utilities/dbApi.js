import { 
  DB_API_PORT,
  DB_API_SERVICE,
  DB_API_INGRESS,
  EXTERNAL_IP_REGEX,
  DB_API_INGRESS_NAME
 } from "../constants/constants.js";
 import manifest from "./manifest.js";
import kubectl from "./kubectl.js";
import eksctl from "./eksctl.js";
import files from "./files.js";
import axios from "axios";

const dbApi = {
  nameExists(name) {
    if (!name) { return false; }
    return (
      this.getAllTests()
        .catch(() => this.restoreIp())
        .then(() => this.getAllTests())
        .then(testData => {
          for (let i = 0; i < testData.length; i++) {
            const test = testData[i];
            if (test.name === name) {
              return true;
            }
          }
          return false;
      })
    );
  },

  logUrl() {
    return (
      kubectl.getIngress(DB_API_INGRESS_NAME)
        .then(({stdout}) => {
          const ingresses = stdout.split("\n");

          for (let rowIdx = 0; rowIdx < ingresses.length; rowIdx++) {
            const ingress = ingresses[rowIdx];
            if (ingress.match(DB_API_INGRESS_NAME)) {
              const ingressInfo = ingress.split(" ");

              for (let colIdx = 0; colIdx < ingressInfo.length; colIdx++) {
                const detail = ingressInfo[colIdx];
                if (detail.match(EXTERNAL_IP_REGEX)) {
                  const url = "http://" + detail + "/tests";
                  const policyData = files.read(files.path(".env")).split("\n")[0];
                  const desiredData = policyData + `\ndb_api_url=${url}`;
                  files.write(".env", desiredData);
                }
              }
            }
          }
        })
    );
  },

  url() {
    const data = files.read(files.path(".env"));
    const dbApiUrlEntry = data.split("\n")[1];
    return dbApiUrlEntry.split("=")[1];
  },

  restoreIp() {
    return (
      eksctl
        .localIp()
        .then(({stdout}) => manifest.createDbApiIngress(stdout))
        .then(() => kubectl.applyManifest(files.path(DB_API_INGRESS)))
        .then(() => this.logUrl())
    );
  },

  newTestId(testPath, name) {
    const testContent = JSON.stringify(files.read(testPath));
    const url = this.url();
      
    return(
      this
        .postRequest(testContent, url, name)
        .catch(() => {
          return (
            this
              .restoreIp()
              .then(() => this.postRequest(testContent, this.url(), name))
          );
        })
        .then(res => {
          return(res.data.id);
        })
    );
  },

  postRequest(script, url, name) {
    const body = name ? { script, name } : { script };

    return axios({
      method: 'post',
      url,
      data: body
    });
  },

  printTestDataTable(tests) {
    let testsDataObj = {};

    tests.forEach(test => {
      testsDataObj[test.name] = {
        "start time": test.start_time,
        "end time": test.end_time,  
        "status": test.status
      };
    });
    console.table(testsDataObj);
  },

  getTest(name) {
    return (
      this
        .getAllTests()
        .catch(() => {
          return (
            this
              .restoreIp()
              .then(() => this.getAllTests())
          );
        })
        .then(tests => {
          return tests.find(test => test.name === name);
        })
    );
  },

  updateTestStatus(id, status) {
    this
      .putRequest(id, { status })
      .catch(() => {
        return (
          this
            .restoreIp()
            .then(() => this.putRequest(id, { status }))
        );
      })
  },

  putRequest(id, data) {
    const url = this.url();

    return (
      axios
        .put(`${url}/${id}`, data)
        .catch(() => {
          return (
            this
              .restoreIp()
              .then(() => axios.put(`${this.url()}/${id}`, data))
          );
        })
        .then(res => {
          return(res.data);
        })
    );
  },

  deleteTest(id) {
    const url = this.url();

    return (
      axios
        .delete(`${url}/${id}`)
        .catch(() => {
          return (
            this
              .restoreIp()
              .then(() => axios.delete(`${this.url()}/${id}`))
          );
        })
        .then(res => {
          return(res.status);
        })
    );
  },

  getAllTests() {
    const url = this.url();

    return (
      axios
        .get(url)
        .catch(() => {
          return (
            this
              .restoreIp()
              .then(() => axios.get(this.url()))
          );
        })
        .then(res => {
          return(res.data);
        })
    ); 
  }
};

export default dbApi;

//dbApi.restoreIp();


