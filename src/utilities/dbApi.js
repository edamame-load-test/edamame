import { 
  DB_API_PORT,
  DB_API_SERVICE,
  EXTERNAL_IP_REGEX
 } from "../constants/constants.js";
import kubectl from "./kubectl.js";
import files from "./files.js";
import axios from "axios";

const dbApi = {
  nameExists(name) {
    if (!name) { return false; }
    return (
      this.getAllTests()
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

  url() {
    return (
      kubectl.getIps()
        .then(({stdout}) => {
          let url;
          const services = stdout.split("\n");

          for (let rowIdx = 0; rowIdx < services.length; rowIdx++) {
            const service = services[rowIdx];
            if (service.match(DB_API_SERVICE)) {
              const serviceInfo = service.split(" ");

              for (let colIdx = 0; colIdx < serviceInfo.length; colIdx++) {
                const detail = serviceInfo[colIdx];
                if (detail.match(EXTERNAL_IP_REGEX)) {
                  return  "http://" + detail + ":" + DB_API_PORT + "/tests";
                }
              }
            }
          }
        })
    );
  },

  newTestId(testPath, name) {
    const testContent = JSON.stringify(files.read(testPath));

    return (
      this.url()
        .then(url => {
          return(
            this.postRequest(testContent, url, name)
              .then(res => {
                return(res.data.id);
              })
            );
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
      this.getAllTests()
        .then(tests => {
          return tests.find(test => test.name === name);
        })
    );
  },

  updateTestStatus(id, status) {
    this.putRequest(id, { status })
      .catch(err => {
        console.log(`Error updating test status: ${err}`);
      });
  },

  putRequest(id, data) {
    return (
      this.url()
        .then(url => {
          return (
            axios.put(`${url}/${id}`, data)
              .then(res => {
                return(res.data);
              })
          );
        })
    );
  },

  deleteTest(id) {
    return (
      this.url()
        .then(url => {
          return (
            axios.delete(`${url}/${id}`)
              .then(res => {
                return(res.status);
              })
          );
        })
    );
  },

  getAllTests() {
    return (
      this.url()
      .then(url => {
        return (
          axios.get(url)
            .then(res => {
              return(res.data);
            })
        );
      })
    );
  }
};

export default dbApi;