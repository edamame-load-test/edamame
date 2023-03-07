import path from "path";
import { fileURLToPath } from 'url';
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let cdkPath = path.join(__dirname, '../cdk');
cdkPath = cdkPath.replace(/ /g, '\\ ');

const cdkApp = {
  async deploy() {
    exec(
      `cd ${cdkPath} && cdk synth && cdk bootstrap && cdk deploy --require-approval never`,
      // tried to pass logCommandResults to dry the cb function passed to exec but get syntax error stating "error" is not defined
      (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout:\n${stdout}`);
      }
    );
  },
  async destroy() {
    exec(
      `cd ${cdkPath} && cdk destroy`, 
      (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout:\n${stdout}`);
      }
    )
  },

  logCommandResults(error, stdout, stderr) {
    if (error) {
      console.error(`cdk app commands failed: ${error.message}`);
    }
    if (stderr) {
      console.error(`standard error data stream: ${stderr}`)
    }
    console.log(`stdout\n${stdout}`);
  }
};


export default cdkApp;
