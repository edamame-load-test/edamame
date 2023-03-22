import { getTests } from "./getTests.js";
import { getTest } from "./getTest.js";

const get = (options) => {
  if (options.name) {
    getTest(options.name);
  } else {
    getTests();
  }
};

export { get };
