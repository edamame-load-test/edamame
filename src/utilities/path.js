import path from "path";
import { fileURLToPath } from 'url';

const fullPath = (url, desiredPathEnd) => {
  const filename = fileURLToPath(url);
  const dirname = path.dirname(filename);
  let fullpath = path.join(dirname, desiredPathEnd);
  return fullpath.replace(/ /g, '\\ ');
};

export default fullPath;