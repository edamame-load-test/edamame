import { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import testService from "../services/testService";

// Send the file to the express server
// The express server will write the script to a temporary file
// It will then run the script, and delete it afterwards

// To Do:
// · Only allow the user to click  the button when the file has been uploaded

function LaunchTestModal({ setIsModal }) {
  const [title, setTitle] = useState(null);
  const [file, setFile] = useState(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false); // Only allow this when the file has been uploaded. Otherwise don't let user click button

  function handleSubmit() {
    testService.startTest(title, file);
    setIsModal(false);
  }

  // When the file gets uploaded, retrieve the content and give it to our "file" state
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];

    const reader = new FileReader();
    reader.readAsText(selectedFile);

    reader.onload = () => {
      setFile(reader.result);
    };

    reader.onerror = (e) => {
      console.error("file error", reader.error);
    };
    setIsFileSelected(true);
  };
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
            <label htmlFor="title" className="font-semibold text-sm">
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
            <label htmlFor="script" className="font-semibold text-sm">
              Script
            </label>
            {
              !isFileSelected ? (
                <input type="file" accept=".js" onChange={handleFileSelect} />
              ) : null
              // <p>{file.name}</p>
            }
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
            <button
              className="bg-blue antialiased text-white rounded px-3 py-2 flex gap-1"
              onClick={handleSubmit}
            >
              Launch a test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LaunchTestModal;
