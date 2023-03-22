import axios from "axios";

const testService = {
  async getTests() {
    try {
      const { data } = await axios.get("/tests");
      return data;
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
};

export default testService;
