import { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import testService from "../services/testService";

function LaunchTestModal({ setIsModal, setTests }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isFileSelected, setIsFileSelected] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    testService.startTest(title, file);
    setIsModal(false);
  }

  // When the file gets uploaded, retrieve the content and give it to our "file" state
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFileName(selectedFile.name);

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
            <label
              htmlFor="script"
              className="border-blue border rounded px-3 py-2 text-blue flex text-center justify-center gap-2 hover:bg-blue hover:antialiased hover:text-white hover:cursor-pointer transition ease-in-out "
            >
              {fileName ? (
                fileName
              ) : (
                <>
                  <FiUploadCloud size={20} /> <p>"Import a script"</p>
                </>
              )}
              {console.log(file)}
            </label>
            <input
              id="script"
              type="file"
              accept=".js"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <div className="flex gap-2 justify-end mt-6">
            <button
              className="border border-slate-400 rounded px-3 py-2 flex gap-1 text-slate-500"
              onClick={() => setIsModal(false)}
            >
              Cancel
            </button>
            <button
              className={`bg-blue antialiased text-white rounded px-3 py-2 flex gap-1 ${
                !isFileSelected || title === "" ? "opacity-50" : ""
              }`}
              disabled={!isFileSelected || title === ""}
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
