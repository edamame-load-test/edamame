import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { fileURLToPath } from 'url';

const files = {
  parseNameFromPath(path) {
    const pathItems = path.split('/');
    return pathItems[pathItems.length -1];
  },

  read(fileName) {
    const file = this.path(fileName);
    return yaml.load(fs.readFileSync(file), 'utf-8');
  },

  write(fileName, data) {
    const filePath = this.path(fileName);
    fs.writeFileSync(filePath, yaml.dump(data));
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