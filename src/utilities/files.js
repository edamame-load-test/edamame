import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { fileURLToPath } from 'url';
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const files = {
  exists(path) {
    return fs.existsSync(path);
  },

  makeDir(dirName) {
    return fs.mkdir(this.path(dirName), (err) => err)
  },

  parseNameFromPath(path) {
    const pathItems = path.split('/');
    return pathItems[pathItems.length -1];
  },

  read(path) {
    return fs.readFileSync(path, 'utf-8');
  },

  readYAML(fileName) {
    const file = this.path(fileName);
    return yaml.load(this.read(file));
  },

  fileNames(path) {
    return fs.readdirSync(path);
  },

  writeYAML(fileName, data) {
    const filePath = this.path(fileName);
    fs.writeFileSync(filePath, yaml.dump(data));
  },

  write(fileName, data) {
    const filePath = this.path(fileName)
    fs.writeFileSync(filePath, data)
  },

  path(fileName, directory="../../manifests/") {
    const desiredPathEnd = directory + fileName;
    const filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(filename);
    let fullpath = path.join(dirname, desiredPathEnd);
    return fullpath.replace(/ /g, '\\ ');
  },

  delete(fileName) {
    return fs.rm(this.path(fileName), (err) => err)
  },

  async filesInDir(directoryPath) {
    if (!this.exists(directoryPath)) {
      return 0;
    }

    const { stdout } = await exec(`cd ${directoryPath} && echo *`);
    return stdout.replaceAll("\n", "").split(" ");
  }
};

export default files;
