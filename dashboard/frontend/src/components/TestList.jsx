import { FiExternalLink, FiMoreVertical } from "react-icons/fi";
import { useState, useEffect } from "react";
import testService from "../services/testService";
import ScriptModal from "./ScriptModal";
import ArchiveModal from "./ArchiveModal";
import LaunchTestModal from "./LaunchTestModal";
import generateGrafanaUrl from "../utilities/generateGrafanaUrl";
import format from "../utilities/formatter";
import Menu from "./Menu";

function TestList({ currTest, setCurrTest }) {
  const [tests, setTests] = useState([]);
  const [isScriptModal, setIsScriptModal] = useState(false);
  const [archiveTestName, setArchiveTestName] = useState("");
  const [isArchiveModal, setIsArchiveModal] = useState(false);
  const [currScript, setCurrScript] = useState({});
  const [isModal, setIsModal] = useState(false);
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    async function getAllTests() {
      const data = await testService.getTests();
      setTests(data);
    }
    getAllTests();
  }, [currTest]);

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
            className="bg-blue antialiased text-white rounded px-3 py-2 mt-4 hover:bg-darkBlue"
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
            currTest={currTest}
          />
        )}
        {isScriptModal && (
          <ScriptModal
            setIsScriptModal={setIsScriptModal}
            currScript={currScript}
          />
        )}
        {isArchiveModal && (
          <ArchiveModal
            setIsArchiveModal={setIsArchiveModal}
            archiveTestName={archiveTestName}
          />
        )}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-xl ml-6">All Tests</h1>
            <button
              className={`bg-blue antialiased text-white rounded px-3 py-2 flex gap-1 hover:bg-darkBlue ${
                Object.keys(currTest).length !== 0 ? "opacity-50" : ""
              }`}
              onClick={() => setIsModal(true)}
              disabled={Object.keys(currTest).length !== 0}
            >
              Launch a test
            </button>
          </div>
          <table className="table-fixed text-slate-800 w-full mt-6">
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
                    <td>{format.date(test.start_time)}</td>
                    <td>
                      {test.status === "completed" ? (
                        format.timeDifference(test.end_time, test.start_time)
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
                      <div className="flex gap-5 items-center">
                        <a
                          href={generateGrafanaUrl(test.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button className="whitespace-nowrap border-blue  border rounded px-3 py-2 text-blue flex gap-1 hover:bg-blue hover:text-white hover:antialiased transition ease-in-out">
                            Open in Grafana <FiExternalLink />
                          </button>
                        </a>
                        <div>
                          <div
                            className="hover:bg-slate-200 hover:cursor-pointer p-2 rounded-full transition z-60 relative"
                            onClick={() => {
                              if (!menu) {
                                setMenu(test.id);
                              } else {
                                setMenu(null);
                              }
                            }}
                          >
                            <FiMoreVertical
                              size={20}
                              className="text-slate-500"
                            />
                          </div>
                          {test.id === menu ? (
                            <Menu
                              test={test}
                              setMenu={setMenu}
                              tests={tests}
                              setTests={setTests}
                              setCurrScript={setCurrScript}
                              setIsScriptModal={setIsScriptModal}
                              setIsArchiveModal={setIsArchiveModal}
                              setArchiveTestName={setArchiveTestName}
                            />
                          ) : null}
                        </div>
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
