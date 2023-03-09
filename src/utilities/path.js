import path from "path";
import { fileURLToPath } from 'url';

const fullPath = (desiredPathEnd) => {
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  let fullpath = path.join(dirname, desiredPathEnd);
  return fullpath.replace(/ /g, '\\ ');
};

export default fullPath;