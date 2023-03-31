import { useState, useEffect } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
import testService from "../services/testService";

function LaunchTestModal({ setIsModal, setTests, setCurrTest, currTest }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const newID = uuidv4();
    testService.startTest(title, file); // Starts the test
    const newTest = {
      id: newID,
      name: title,
      status: "Pending",
      start_time: Date.now(),
      script: JSON.stringify(file),
    };
    // setCurrTest(newTest); // Pushes the newTest onto the currTest instantly.
    setLoading(true);
    // setTests((prevTests) => [...prevTests, newTest]); // Updates the list of tests instantly
    // setIsModal(false);
  }

  useEffect(() => {
    if (Object.keys(currTest).length !== 0) setIsModal(false);
  }, [currTest, setIsModal]);

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
      <div
        className="bg-white max-w-xl rounded p-5 absolute top-20 left-1/2 transform -translate-x-1/2
w-[70%]"
      >
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
                  <FiUploadCloud size={20} /> <p>Import a script</p>
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
            {loading ? (
              <button
                disabled
                type="button"
                class="text-white bg-blue  rounded px-3 py-2"
              >
                <svg
                  aria-hidden="true"
                  role="status"
                  class="inline w-4 h-4 mr-3 text-white animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
                Launching test...
              </button>
            ) : (
              <button
                className={`bg-blue antialiased text-white rounded px-3 py-2 flex gap-1 ${
                  !isFileSelected || title === "" ? "opacity-50" : ""
                }`}
                disabled={!isFileSelected || title === ""}
                onClick={handleSubmit}
              >
                Launch a test
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default LaunchTestModal;
