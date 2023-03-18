import readlineSync from "readline-sync";
import manifest from "./manifest.js";
import crypto from 'crypto';

const password = {
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