import readlineSync from "readline-sync";

export const processGrafPgUserCreds = () => {
  console.log(
    `Please enter a username & password to associate ` +
    `with your Grafana dashboard & Postgres database`
  );
  const username = readlineSync.question("Username: ");
  const password = readlineSync.question("Password: ");
  console.log("Received credentials for PG & Grafana:");
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  // do we want users ability to confirm the password they entered?
  //   > have them re-enter to confirm? and if doesn't match trigger
  //      new pw generation
  // update relevant configMaps with these credentials
};

