const cli = (spinner, message, successFlag=true) => {
  if (message) {
    spinner.text = message;
  }
  successFlag ? spinner.succeed() : spinner.fail();
};

export default cli;