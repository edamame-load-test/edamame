import axios from "axios";

const testService = {
  getAll: async () => {
    const response = await axios.get("http://localhost:3001/tests");
    return response.data;
  },

  get: async (id) => {
    const response = await axios.get(`http://localhost:3001/tests/${id}`);
    return response.data;
  },

  // payload = {
  //   "name": "My Test",
  //   "script": "import http from..."
  // }
  create: async (payload = {}) => {
    const response = await axios.post("http://localhost:3001/tests", payload);
    return response.data;
  },

  // payload = {
  //   "status": "running"/"completed"
  // }
  update: async (id, payload = {}) => {
    const response = await axios.put(`http://localhost:3001/tests/${id}`, payload);
    return response.data;
  },

  remove: async (id) => {
    const response = await axios.delete(`http://localhost:3001/tests/${id}`);
    return true;
  }
}

export default testService;