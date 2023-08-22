import ArchiveUpload from "./ArchiveUpload";
import ArchiveDelete from "./ArchiveDelete";
import { useState, useEffect } from "react";
import testService from "../services/testService";

function ArchivePending({ archiveTestName }) {
  return (
    <div className="inset-0 ">
      <div className="bg-white max-w-xl h-1/6 rounded p-5 absolute top-20 left-1/2 transform -translate-x-1/2 w-[70%]">
        <h2 className="text-xl font-bold pb-5">{`Manage Your AWS S3 Archive`}</h2>       
        {`Checking to see if ${archiveTestName} already exists in the archive...`}
      </div>
     </div>
  );
}

function ArchiveModal({ archiveTestName, setIsArchiveModal }) {
  const [archiveExists, setArchiveExists] = useState("");
  const [archiveMessage, setArchiveMessage] = useState("");

  function clearModal(time) {
    setTimeout(() => {
      setIsArchiveModal(false);
      setArchiveMessage("");
    }, time);
  }

  useEffect(() => {
    async function checkArchiveForTest() {
      try {
        const data = await testService.archiveExists(archiveTestName);
        setArchiveExists(data.archiveExists);
      } catch {
        setArchiveExists(false);
      }
    }
    checkArchiveForTest();
  }, [archiveTestName]);


  return (
    <>
    {archiveExists === false &&
      <ArchiveUpload 
        archiveTestName={archiveTestName}
        setIsArchiveModal={setIsArchiveModal}
        archiveMessage={archiveMessage}
        setArchiveMessage={setArchiveMessage}
        clearModal={clearModal}
      />
    } 
    {archiveExists &&
      <ArchiveDelete
        archiveTestName={archiveTestName}
        setIsArchiveModal={setIsArchiveModal}
        archiveMessage={archiveMessage}
        setArchiveMessage={setArchiveMessage}
        clearModal={clearModal}
      />
    }
    {archiveExists === "" &&
      <ArchivePending
        archiveTestName={archiveTestName}
      />
    }
    </>
  );
}

export default ArchiveModal;
