import React from "react";
import { useState } from "react";
import testService from "../services/testService";
import Select from 'react-select';
import {
  DEFAULT_AWS_S3_STORAGE_CLASS, 
  VALID_STORAGE_CLASSES
} from "../constants/constants.js";
import { FiExternalLink } from "react-icons/fi";

function ArchiveUpload({ archiveTestName, setIsArchiveModal, archiveMessage, setArchiveMessage, clearModal }) {
  const [storageClass, setStorageClass] = useState(DEFAULT_AWS_S3_STORAGE_CLASS);

  async function handleArchivingTest(e) {
    e.preventDefault();
    setArchiveMessage(`Uploading ${archiveTestName} to AWS S3...`);
    try {
      await testService.archiveTest(archiveTestName, storageClass);
      setArchiveMessage(`Successfully uploaded ${archiveTestName} into AWS S3 with the storage class ${storageClass}.`);
      clearModal(6000);
    } catch (err) {
      console.log(err);
      setArchiveMessage(`Issue communicating with AWS to archive test: ${archiveTestName}. ` +
       `Please try again later. If the issue persists, please reach out to an Edamame developer.` +
       ` Your test may have a substantial amount of data and require a customized archive strategy.`);
      clearModal(10000);
    }
  }

  function handleChangeStorageClass(event) {
    setStorageClass(event.value);
  }

  const storageOptions = Object.keys(VALID_STORAGE_CLASSES).map(storageClass => {
    return { value: storageClass, label: VALID_STORAGE_CLASSES[storageClass]};
  });

  return (
    <div className="inset-0 ">
      <div className={`bg-white max-w-xl h-${archiveMessage ? 3 : 2}/6 rounded p-5 absolute top-20 left-1/2 transform -translate-x-1/2 w-[70%]`}>
        <h2 className="text-xl font-bold pb-5">{`Archive ${archiveTestName} in AWS S3`}</h2>  
        {archiveMessage && <p className="text-pink rounded-md px-3 py-2 pl-4 pr-4 pb-3 mb-4 bg-pink/10">{archiveMessage}</p>}
        <p className="pb-10">
          Archiving allows you to persist load test data beyond the life of your current cluster should you need or want to tear it down. 
          The S3 storage classes available have varying charges and SLAs. Be sure to read the AWS docs linked below to select the storage
          class that best fits your needs.
        </p>
        <p className="text-lg pb-2">Select an S3 Storage Class:</p>
        <Select
          options={storageOptions}
          placeholder={VALID_STORAGE_CLASSES[storageClass]}
          value={storageClass}
          onChange={handleChangeStorageClass}
        />
        <div className="flex pt-3 gap-2 justify-end mt-6">
          <a
            href="https://aws.amazon.com/s3/storage-classes"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-pink antialiased text-white rounded px-2 py-2 flex gap-1">
              Read about S3 storage options <FiExternalLink />
            </button>
          </a>
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
            onClick={handleArchivingTest}
            disabled={archiveMessage !== ""}
          >
            Archive test
          </button>
        </div>
      </div>
     </div>
  );
}

export default ArchiveUpload;
