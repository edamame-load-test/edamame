import axios from "axios";

const clusterService = {
  async getClusterUrl() {
    try {
      const { data } = await axios.get("/cluster");
      return data;
    } catch (error) {
      return undefined; // Undefined if there's no URL, so that I can check for that and just provide a generic URL
    }
  },
};

export default clusterService;
