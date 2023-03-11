import readlineSync from "readline-sync";
import manifest from "./manifest.js";

const userInput = {
  getPassword() {
    console.log(
      `Please enter a password to associate ` +
      `with your Edamame Grafana dashboard & ` +
      `Postgres database account.`
    );
    const password = readlineSync.question("Password: ");
    console.log("Password for PG & Grafana has been set as:");
    console.log(password);
    return password;
  },

  processPassword() {
    const password = this.getPassword();
    manifest.setPgPw(password);
    // do we want users ability to confirm the password they entered?
    // <> have them re-enter to confirm?
  }
};

export default userInput;