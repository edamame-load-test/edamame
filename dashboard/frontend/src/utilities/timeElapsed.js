const timeElapsed = {
  format(seconds) {
    const mins = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return (
      `${mins} ${mins > 1 ? "min" : "mins"}
      ${remainingSeconds < 10 ? "0" : ""}
      ${remainingSeconds} seconds`
    );
  },

  calculate(startTime) {
    const now = new Date();
    return Math.floor((now - startTime) / 1000);
  },

  display(startTime) {
    const elapsedSeconds = this.calculate(startTime);
    return this.format(elapsedSeconds)
  }
};

export default timeElapsed;
