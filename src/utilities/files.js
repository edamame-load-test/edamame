import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { fileURLToPath } from 'url';

const files = {
  exists(path) {
    return fs.existsSync(path);
  },

  create() {

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

};

export default files;
