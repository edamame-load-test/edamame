import {
  DB_API_INGRESS,
  EXTERNAL_IP_REGEX,
  DB_API_INGRESS_NAME,
  DISPLAY_TESTS_NUM_DASHES,
  DISPLAY_TEST_TITLE_SPACES
} from "../constants/constants.js";
import manifest from "./manifest.js";
import kubectl from "./kubectl.js";
import eksctl from "./eksctl.js";
import files from "./files.js";
import axios from "axios";

const dbApi = {
  async nameExists(name) {
    if (!name) {
      return false;
    }

    try {
      let testData = await this.getAllTests();
      return this.parseTestData(testData, "testName", name);
    } catch {
      await this.restoreIp();
      let testData = await this.getAllTests();
      return this.parseTestData(testData, "testName", name);
    }
  },

  parseTestData(testData, attribute, comparisonValue = "") {
    for (let i = 0; i < testData.length; i++) {
      const test = testData[i];
      if (attribute === "testName" && test.name === comparisonValue) {
        return true;
      } else if (attribute === "status" && test.status.match(/(running|status)/)) {
        return true;
      }
    }
    return false;
  },

  async logUrl() {
    const { stdout } = await kubectl.getIngress(DB_API_INGRESS_NAME);
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
  },

  url() {
    const data = files.read(files.path(".env"));
    const dbApiUrlEntry = data.split("\n")[1];
    return dbApiUrlEntry.split("=")[1];
  },

  async restoreIp() {
    const { stdout } = await eksctl.localIp();
    manifest.createDbApiIngress(stdout);

    await kubectl.applyManifest(files.path(DB_API_INGRESS));
    await this.logUrl();
  },

  async newTestId(testPath, name) {
    const content = JSON.stringify(files.read(testPath));
    let url = this.url();

    try {
      let response = await this.postRequest(content, url, name);
      return response.data.id;
    } catch {
      await this.restoreIp();
      let res = await this.postRequest(content, this.url(), name);
      return res.data.id;
    }
  },

  postRequest(script, url, name) {
    const body = name ? { script, name } : { script };

    return axios({
      method: "post",
      url,
      data: body,
    });
  },

  printAllTestDetails(test) {
    this.printTestDataTable([test]);

    let spaces = " ".repeat(DISPLAY_TEST_TITLE_SPACES);
    console.log(`${spaces} Test script content: ${spaces}`);
    console.log(`${"-".repeat(DISPLAY_TESTS_NUM_DASHES)}`);

    test.script.split("\\n").forEach(line => {
      console.log(line);
    });  
  },

  printTestDataTable(tests) {
    let testsDataObj = {};
    tests.forEach((test) => {
      testsDataObj[test.name] = {
        "start time": test.start_time,
        "end time": test.end_time,
        status: test.status,
      };
    });
    console.table(testsDataObj);
  },

  async getTest(name) {
    try {
      let tests = await this.getAllTests();
      return tests.find((test) => test.name === name);
    } catch {
      await this.restoreIp();
      let testData = await this.getAllTests();
      return testData.find((test) => test.name === name);
    }
  },

  async updateTestStatus(id, status) {
    try {
      return this.patchRequest(id, { status });
    } catch {
      await this.restoreIp();
      return this.patchRequest(id, { status });
    }
  },

  async patchRequest(id, data) {
    const url = this.url();

    try {
      let response = await axios.patch(`${url}/${id}`, data);
      return response.data;
    } catch {
      await this.restoreIp();
      let res = await axios.patch(`${this.url()}/${id}`, data);
      return res.data;
    }
  },

  async deleteTest(id) {
    const url = this.url();

    try {
      let response = await axios.delete(`${url}/${id}`);
      return response.data;
    } catch {
      await this.restoreIp();
      let res = await axios.delete(`${this.url()}/${id}`);
      return res.data;
    }
  },

  async getAllTests() {
    const url = this.url();

    try {
      let response = await axios.get(url);
      return response.data;
    } catch {
      await this.restoreIp();
      let res = await axios.get(this.url());
      return res.data;
    }
  },

  async testIsRunning() {
    try {
      let testData = await this.getAllTests();
      return this.parseTestData(testData, "status");
    } catch {
      await this.restoreIp();
      let tests = await this.getAllTests();
      return this.parseTestData(tests, "status");
    }
  },

  async archiveTest(testName) {
    const url = `${this.url()}/archive/${testName}`;

    try {
      let response = await axios.post(`${url}`, {});
      return response.data;
    } catch {
      await this.restoreIp();
      const newUrl = `${this.url()}/archive/${testName}`;
      let res = await axios.post(`${newUrl}`, {});
      return res.data;
    }
  }

};

export default dbApi;