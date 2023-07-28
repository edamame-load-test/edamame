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

  async assign() {
    const password = crypto.randomUUID();
    await manifest.setPgDbApiGrafCredentials(password);
  }
};

export default password;