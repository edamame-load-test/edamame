import readlineSync from "readline-sync";

export const processGrafPgUserCreds = () => {
  console.log(
    `Please enter a password to associate ` +
    `with your Edamame Grafana dashboard & ` +
    ` Postgres database account.`
  );
  const password = readlineSync.question("Password: ");
  console.log("Password for PG & Grafana has been set as:");
  console.log(password);
  // do we want users ability to confirm the password they entered?
  //   > have them re-enter to confirm? and if doesn't match trigger
  //      new pw generation
  // update relevant configMaps with these credentials
};

