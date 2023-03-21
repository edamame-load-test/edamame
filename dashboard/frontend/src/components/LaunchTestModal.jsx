import { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";

// Send the file to the express server
// The express server will write the script to a temporary file
// It will then run the script, and delete it afterwards

const handleFileSelect = (file) => {};
function handleSubmit() {}

function LaunchTestModal({ setIsModal }) {
  const [title, setTitle] = useState("");
  const [filePath, setFilePath] = useState("");
  return (
    <div className="inset-0 ">
      <div
        className="block fixed inset-0 cursor-default bg-black/50"
        onClick={() => setIsModal(false)}
      ></div>
      <div className="bg-white max-w-xl rounded p-5 absolute w-[50%] left-[33%] top-48">
        <h2 className="text-lg font-bold">Create Test</h2>
        <form onSubmit={() => handleSubmit()}>
          <div className="mt-4">
            <label for="title" className="font-semibold text-sm">
              Title
            </label>
            <input
              className="block border border-slate-300 rounded p-2 w-full"
              type="text"
              name="title"
              id="title"
              placeholder="E.g. Websockets Loadtest"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            ></input>
          </div>
          <div className="mt-4">
            <label for="script" className="font-semibold text-sm">
              Script
            </label>
            <input type="file" accept=".js" onFileSelect={handleFileSelect} />
            {/* <input
              className="border border-blue w-full text-blue rounded py-2 flex gap-2 justify-center"
              type="file"
            >
              <FiUploadCloud size={20} />
              Import a script
            </input> */}
          </div>
          <div className="flex gap-2 justify-end mt-6">
            <button
              className="border border-slate-400 rounded px-3 py-2 flex gap-1 text-slate-500"
              onClick={() => setIsModal(false)}
            >
              Cancel
            </button>
            <button className="bg-blue antialiased text-white rounded px-3 py-2 flex gap-1">
              Launch a test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LaunchTestModal;
