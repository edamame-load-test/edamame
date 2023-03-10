const cli = (spinner, message, stop) => {
  spinner.text = message;
  
  if (stop === "success") {
    spinner.succeed();
  }
  
  if (stop === "fail") {
    spinner.fail();
  }
};

export default cli;