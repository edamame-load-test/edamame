import React from "react";
import testService from "../services/testService";

function ArchiveDelete({ archiveTestName, setIsArchiveModal, archiveMessage, setArchiveMessage, clearModal }) {
  async function handleUnarchivingTest(e) {
    e.preventDefault();
    setArchiveMessage(`Deleting ${archiveTestName} from AWS S3...`);
    try {
      await testService.deleteTestFromArchive(archiveTestName);
      setArchiveMessage(`Successfully deleted ${archiveTestName} from AWS S3.`);
      clearModal(4000);
    } catch {
      setArchiveMessage(`Issue communicating with AWS to delete ` +
        `${archiveTestName} from AWS S3. Please try again later.`);
      clearModal(6000);
    }
  }

  return (
    <div className="inset-0 ">
      <div className={`bg-white max-w-xl h-${archiveMessage ? 2 : 1}/6 rounded p-5 absolute top-20 left-1/2 transform -translate-x-1/2 w-[70%]`}>
        <h2 className="text-xl font-bold pb-5">{`${archiveTestName} Exists in AWS S3 Archive`}</h2> 
        {archiveMessage && <p className="text-pink rounded-md px-3 py-2 pl-4 pr-4 pb-3 mb-4 bg-pink/10">{archiveMessage}</p>}
        <p>
          {`You have already uploaded ${archiveTestName} to your AWS S3 Bucket. If you no longer want it in your archive, you can delete it.`}
        </p>
        <div className="flex gap-2 justify-end mt-6">
        <button
          className="border border-slate-400 rounded px-3 py-2 flex gap-1 text-slate-500"
          onClick={() => setIsArchiveModal(false)}
        >
          {archiveMessage !== "" ? "Close" : "Cancel" }
        </button>  
        <button
          className={`bg-blue antialiased text-white rounded px-3 py-2 flex gap-1 ${
            archiveMessage !== "" ? "opacity-50" : ""
          }`}
          onClick={handleUnarchivingTest}
          disabled={archiveMessage !== ""}
        >
          Delete test from archive
        </button>
        </div>
      </div>
     </div>
  );
}

export default ArchiveDelete;
