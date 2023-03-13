import ora from "ora";
import dateFormat from "dateformat";

class Spinner {
  constructor(initialMsg) {
    const options = {
      prefixText: () => dateFormat(new Date(), '[hh:MM:ss:l]'),
    }

    this.spinner = ora(options);
    this.spinner.info(initialMsg);
    this.spinner.start();
  }

  update(text) {
    this.spinner.text = text;
  }

  succeed(msg) {
    this.spinner.succeed(msg);
  }

  fail(msg) {
    this.spinner.fail(msg);
  }

  info(msg) {
    this.spinner.info(msg);
  }

  start() {
    this.spinner.start();
  }
}

export default Spinner;