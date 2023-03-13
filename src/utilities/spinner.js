import ora from "ora";

function Spinner(initialMsg) { 
  this.spinner = ora(initialMsg).start();
}

Spinner.prototype.update = function(text) {
  this.spinner.text = text;
}

Spinner.prototype.succeed = function(msg) {
  if (msg) {
    this.spinner.text = msg;
  }
  this.spinner.succeed();
}

Spinner.prototype.fail = function(msg) {
  if (msg) {
    this.spinner.text = msg;
  }
  this.spinner.fail();
}

export default Spinner;



