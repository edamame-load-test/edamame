// TODO
// · If the test has not been completed write "in progress"
// · Translate the time into a proper format
// · Add links to the buttons

import tests from "../assets/test-data/tests";
import { FiExternalLink, FiMoreVertical } from "react-icons/fi";
import { useState } from "react";
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

function TestList() {
  const [isModal, setIsModal] = useState(false);
  return (
    <>
      {isModal && <LaunchTestModal setIsModal={setIsModal} />}
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-xl ml-6">All Tests</h1>
          <button className="bg-blue antialiased text-white rounded px-3 py-2 flex gap-1">
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
            {tests.map((test) => (
              <tr key={test.id} className="border-b">
                <td className="px-6 py-5">{test.name}</td>
                <td>{new Date(test.date).toDateString()}</td>
                {/* This is only if the test is completed */}
                <td>
                  {timeDifferenceFormatted(test.end_time, test.start_time)}
                </td>
                <td>
                  <div className="flex gap-4 items-center">
                    <a href="http://www.google.com">
                      <button className="border-blue border rounded px-3 py-2 text-blue flex gap-1">
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

export default TestList;
