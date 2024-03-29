import { useState, useEffect } from "react";
import { FiExternalLink } from "react-icons/fi";
import logo from "../assets/logo.svg";
import testService from "../services/testService";
import timeElapsed from "../utilities/timeElapsed";
import generateGrafanaUrl from "../utilities/generateGrafanaUrl";

function Heading({ currTest, setCurrTest }) {
  const [elapsedTime, setElapsedTime] = useState("");
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    async function checkRunningTest() {
      const tests = await testService.getTests(); 
      const activeTests = tests.filter((test) => test.status !== "completed");
      if (activeTests.length === 0) {
        setCurrTest({});
        setIsStopping(false);
      } else {
        setCurrTest(activeTests[0]);
      }
    }
    const intervalId = setInterval(checkRunningTest, 3000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (Object.keys(currTest).length !== 0) {
      const startTime = new Date(currTest.start_time);
      setElapsedTime(timeElapsed.display(startTime));

      const intervalId = setInterval(() => {
        setElapsedTime(timeElapsed.display(startTime));
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [currTest]);

  return (
    <div className="bg-green-500 text-white antialiased py-10 h-80">
      <div className="max-w-4xl mx-auto text-center">
        <img
          src={logo}
          alt="Edamame Logo"
          className={`w-24 align-center inline ${
            Object.keys(currTest).length !== 0 ? "animate-spin-slow" : ""
          }`}
        />
        {/* If there is a test running */}
        {Object.keys(currTest).length === 0 ? (
          <>
            <h1 className="font-bold align-center text-xl mt-4">
              Welcome to Edamame
            </h1>
            <p className="green-100 text-lg my-4">
              Edamame is an open source, distributed load-testing tool. You can
              upload a K6 test script, and then start a test to deploy a
              distributed load test to your AWS account.
            </p>
            <a
              href="https://k6.io/docs/using-k6/http-requests/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="border border-white rounded px-3 py-[8px] my-4 hover:bg-white transition hover:text-green-900">
                Learn to write tests using K6
              </button>
            </a>
          </>
        ) : (
          <>
            <h1 className="font-bold align-center text-xl mt-4">
              {`Load test is ${isStopping ? "stopping" : currTest.status}`}...
            </h1>
            {isStopping ? (
              <p className="text-lg mt-2">
                Your test "<span className="font-bold">{currTest.name}</span>""
                is currently being stopped. We need to remove all resources from
                AWS, so this might take a couple minutes. You won’t be able to
                launch a new test until this one ends.
              </p>
            ) : (
              <p className="text-lg mt-2">
                Your test "<span className="font-bold">{currTest.name}</span>""
                has been running for{" "}
                <span className="font-bold min-w-[5rem] inline-block">
                  {elapsedTime}
                </span>
                . You won’t be able to run any other tests until this one
                finishes or until you stop it.
              </p>
            )}

            <div className="flex gap-2 justify-center mt-2">
              <a
                href={generateGrafanaUrl(currTest.name)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-blue antialiased flex gap-1 align-middle text-white rounded px-3 py-2 mt-4">
                  Open in Grafana <FiExternalLink />
                </button>
              </a>
              <button
                className={`bg-pink antialiased flex text-white gap-1 align-middle rounded px-3 py-2 mt-4 ${
                  isStopping ? "opacity-50" : ""
                }`}
                onClick={async () => {
                  await testService.stopTest();
                  setIsStopping(true);
                }}
                disabled={isStopping}
              >
                Stop Test
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Heading;
