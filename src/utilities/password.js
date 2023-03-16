import readlineSync from "readline-sync";
import manifest from "./manifest.js";
import crypto from 'crypto';

const password = {
  get() {
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

  create(len) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  assign() {
    const password = crypto.randomUUID();
    return manifest.setPgGrafCredentials(password);
  }
};

export default password;