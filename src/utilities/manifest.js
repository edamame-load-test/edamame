import {
  NUM_VUS_PER_POD, 
  K6_CR_FILE,
  PG_SECRET_FILE,
  CLUSTER_NAME
} from "../constants/constants.js";
import files from "./files.js";

const manifest = {
  createK6Cr(path, numVus, testId) {
    const k6CrData = files.read(K6_CR_FILE);
    const envObjs = k6CrData.spec.runner.env;

    k6CrData.spec.parallelism = this.parallelism(numVus);
    k6CrData.spec.script.configMap.name = testId;
    k6CrData.spec.script.configMap.file = files.parseNameFromPath(path);
    envObjs.forEach(obj => {
      if (obj.name === "K6_STATSD_NAMESPACE") {
        obj.value = testId;
      }
    });

    files.write(K6_CR_FILE, k6CrData);
  },

  latestK6TestId() {
    const data = files.read(K6_CR_FILE);
    return data.spec.script.configMap.name;
  },

  setPgPw(pw) {
    const pgSecret = files.read(PG_SECRET_FILE);
    pgSecret.data["psql-username"] = this.base64(CLUSTER_NAME);
    pgSecret.data["psql-password"] = this.base64(pw);
    // add/update grafana secret to use same creds
    files.write(PG_SECRET_FILE, pgSecret);
  },

  base64(value) {
    return Buffer.from(value, 'utf8').toString('base64');
  },

  parallelism(numVus) {
    return Math.ceil(numVus / NUM_VUS_PER_POD);
  }
};

export default manifest;

