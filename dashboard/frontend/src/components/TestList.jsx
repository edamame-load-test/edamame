// TODO
// · If the test has not been completed write "in progress"
// · Translate the time into a proper format
// · Add links to the buttons

import { FiExternalLink, FiMoreVertical } from "react-icons/fi";
import { useState, useEffect } from "react";
import testService from "../services/testService";
import LaunchTestModal from "./LaunchTestModal";

function timeDifferenceFormatted(endTime, startTime) {
  let seconds = Math.floor((new Date(endTime) - new Date(startTime)) / 1000); // convert to seconds and round down
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds - hours * 3600) / 60);
  let hoursFormatted = hours > 0 ? `${hours}hr${hours === 1 ? "" : "s"}` : ""; // handle singular/plural
  let minutesFormatted =
    minutes > 0 ? `${minutes}min${minutes === 1 ? "" : "s"}` : ""; // handle singular/plural
  if (hours > 0) {
    return `${hoursFormatted} ${minutesFormatted}`; // include both hours and minutes
  } else if (minutes > 0) {
    return minutesFormatted; // only include minutes
  } else {
    return "0 mins"; // if below a minute
  }
}

function formatDate(date) {
  const monthDay = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${monthDay} · ${time}`;
}

function TestList({ currTest, setCurrTest }) {
  const [tests, setTests] = useState([]);
  const [isModal, setIsModal] = useState(false);
  useEffect(() => {
    async function getAllTests() {
      const data = await testService.getTests();
      setTests(data);
    }
    getAllTests();
  }, [currTest]);

  // Empty State (If there aren't any tests yet)
  if (tests.length === 0) {
    return (
      <>
        {isModal && (
          <LaunchTestModal
            setIsModal={setIsModal}
            setTests={setTests}
            currTest={currTest}
            setCurrTest={setCurrTest}
          />
        )}
        <div className="max-w-4xl bg-slate-200 mx-auto mt-10 rounded p-6 text-center">
          <h3 className="text-lg font-bold">Launch your first test</h3>
          <p className="text-slate-700 text-lg mt-2">
            Launch your first K6 load test. Once launched, a list of your tests
            will appear below.
          </p>
          <button
            data-tooltip-target="tooltip-default"
            className="bg-blue antialiased text-white rounded px-3 py-2 mt-4"
            onClick={() => setIsModal(true)}
            title="testing a title"
          >
            Launch a test
          </button>
        </div>
      </>
    );
  } else {
    return (
      <>
        {isModal && (
          <LaunchTestModal
            setIsModal={setIsModal}
            setTests={setTests}
            currTest={currTest}
            setCurrTest={setCurrTest}
          />
        )}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-xl ml-6">All Tests</h1>
            <button
              data-tooltip-target="tooltip-default"
              className={`bg-blue antialiased text-white rounded px-3 py-2 flex gap-1 ${
                Object.keys(currTest).length !== 0 ? "opacity-50" : ""
              }`}
              onClick={() => setIsModal(true)}
              disabled={Object.keys(currTest).length !== 0}
            >
              Launch a test
            </button>
          </div>
          <table class="table-fixed text-slate-800 w-full mt-6">
            <thead className="text-sm bg-slate-200 text-left">
              <tr className="border-b border-slate-300">
                <th className="py-3 px-6 rounded-tl">Name</th>
                <th>Date</th>
                <th>Total Time</th>
                <th className="rounded-tr text-slate-200">actions</th>
              </tr>
            </thead>
            <tbody>
              {tests
                .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
                .map((test) => (
                  <tr key={test.id} className="border-b">
                    <td className="px-6 py-5">{test.name}</td>
                    <td>{formatDate(new Date(test.start_time))}</td>
                    <td>
                      {test.status === "completed" ? (
                        timeDifferenceFormatted(test.end_time, test.start_time)
                      ) : (
                        <div className="flex align-middle gap-1">
                          <p className=" py-1 ">In Progress </p>
                          <p className="bg-[#E3F1D6] text-[#0B4853] py-1 px-2 rounded">
                            New
                          </p>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-4 items-center">
                        <a href="http://www.google.com">
                          <button className="border-blue border rounded px-3 py-2 text-blue flex gap-1 hover:bg-blue hover:text-white hover:antialiased transition ease-in-out">
                            Open in Grafana <FiExternalLink />
                          </button>
                        </a>
                        <FiMoreVertical size={20} className="text-slate-500" />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
}

export default TestList;
