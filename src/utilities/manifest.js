import {
  NUM_VUS_PER_POD,
  K6_CR_FILE,
  PG_SECRET_FILE,
  GRAF_DS_FILE,
  CLUSTER_NAME,
  GRAF_JSON_DBS
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
        obj.value = `${testId}.`;
      }
    });

    files.write(K6_CR_FILE, k6CrData);
  },

  latestK6TestId() {
    const data = files.read(K6_CR_FILE);
    return data.spec.script.configMap.name;
  },

  setPgGrafCredentials(pw) {
    const pgSecret = files.read(PG_SECRET_FILE);
    const grafCreds = files.read(GRAF_DS_FILE);

    grafCreds.datasources[0].user = CLUSTER_NAME;
    grafCreds.datasources[0].secureJsonData.password = pw;

    pgSecret.data["psql-username"] = this.base64(CLUSTER_NAME);
    pgSecret.data["psql-password"] = this.base64(pw);

    files.write(PG_SECRET_FILE, pgSecret);
    files.write(GRAF_DS_FILE, grafCreds);
  },

  forEachGrafJsonDB(callback) {
    const dirPath = files.path(`/${GRAF_JSON_DBS}`);
    const names = files.fileNames(dirPath);
    names.forEach(name => {
      if (name.match(".json")) {
        const nameNoExt = name.replace("\.json", "").replace("_", "-");
        callback(nameNoExt, `${dirPath}/${name}`);
      }
    });
  },

  base64(value) {
    return Buffer.from(value, 'utf8').toString('base64');
  },

  parallelism(numVus) {
    return Math.ceil(numVus / NUM_VUS_PER_POD);
  }
};

export default manifest;

