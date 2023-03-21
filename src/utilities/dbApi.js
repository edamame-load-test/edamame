import { 
  DB_API_PORT,
  PORT_FORWARD_DELAY
 } from "../constants/constants.js";
import kubectl from "./kubectl.js";
import { promisify } from "util";
import child_process from "child_process";
import files from "./files.js";
const exec = promisify(child_process.exec);
import axios from "axios";

const dbApi = {
  nameExists(name) {
    return (
      this.getAllTests()
        .then(testData => {

          for (let i = 0; i< testData.length; i++) {
            const test = testData[i];
            if (test.name === name) {
              return true;
            }
          }
          return false;
      })
    );
  },

  getLocalAccess() {
    kubectl
      .exactPodName("db-api")
      .then(podName => {
        kubectl.tempPortForward(podName, DB_API_PORT, DB_API_PORT);
      });
  },

  newTestId(testPath, name) {
    this.getLocalAccess();
    const testContent = JSON.stringify(files.read(testPath));
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.postRequest(testContent, name)
       .then(response => {
          kubectl.endPortForward("db-api");
          const testId = response.data.id;
          resolve(testId);
       })
      }, PORT_FORWARD_DELAY)
    });
  },

  url(addend="") {
    return `http://localhost:${DB_API_PORT}/tests`;
  },

  postRequest(script, name) {
    const body = name ? { script, name } : { script };

    return axios({
      method: 'post',
      url: this.url(),
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
      this.getAllTests()
        .then(tests => {
          return tests.find(test => test.name === name);
        })
    );
  },

  updateTestStatus(name, status) {
    this.getTest(name)
      .then(test => {
        this.putRequest(test.id, { status })
          .catch(err => {
            console.log(`Error updating test status: ${err}`);
          })
      });
  },

  putRequest(id, data) {
    this.getLocalAccess();

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return (
          axios.put(`${this.url()}/${id}`, data)
            .then((response) => {
              kubectl.endPortForward("db-api");
              resolve(response.data);
            })
        );
      }, PORT_FORWARD_DELAY)
    });
  },

  deleteTest(id) {
    this.getLocalAccess();

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return (
          axios.delete(`${this.url()}/${id}`)
            .then((response) => {
              kubectl.endPortForward("db-api");
              resolve(response.status);
            })
        );
      }, PORT_FORWARD_DELAY)
    });
  },

  getAllTests() {
    this.getLocalAccess();

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return (
          axios.get(this.url())
            .then((response) => {
              kubectl.endPortForward("db-api");
              resolve(response.data);
            })
        );
      }, PORT_FORWARD_DELAY)
    });
  }
};

export default dbApi;
