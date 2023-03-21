import axios from "axios";

const testService = {
  async getTests() {
    console.log("getting tests");
    try {
      const { data } = await axios.get("/tests");
      console.log(axios.get("/tests"));
      return data;
    } catch (error) {
      console.log(`Error fetching data: ${error}`);
    }
  },
};

export default testService;
