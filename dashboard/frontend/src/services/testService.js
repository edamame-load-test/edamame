import axios from "axios";

const testService = {
  async getTests() {
    try {
      const { data } = await axios.get("/tests");
      return data === "" ? [] : data;
    } catch (error) {
      console.log(`Error fetching data: ${error}`);
    }
  },

  async startTest(title, script) {
    try {
      await axios.post("/tests", {
        title,
        script,
      });
    } catch (error) {
      console.log(`Error uploading a test: ${error}`);
    }
  },

  async stopTest() {
    await axios.post("/tests/stop");
  },

  async deleteTest(name) {
    await axios.delete(`/tests/${name}`);
  },

  async teardown() {
    await axios.post("/tests/teardown");
  },

  async getTest(name) {
    const { data } = await axios.get(`/tests/${name}`);
    return data;
  },

  async archiveExists(name) {
    const { data } = await axios.get(`/tests/archive/${name}`);
    return data;
  },

  async archiveTest(testName, storageClass) {
    const res = await axios.post(
      `/tests/archive/${testName}?storage=${storageClass}`
    );
    return res.data;
  },

  async deleteTestFromArchive(testName) {
    await axios.delete(`/tests/archive/${testName}`);
  },
};

export default testService;
