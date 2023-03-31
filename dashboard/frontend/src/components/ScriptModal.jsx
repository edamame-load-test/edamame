import React from "react";
import formatDate from "../utilities/formatDate";

// Escape certain special HTML characters

function formatScript(script) {
  return script.replace(/\\"/g, '"').replace(/\\n/g, "\n");
}

function ScriptModal({ currScript, setIsScriptModal }) {
  return (
    <div className="inset-0 ">
      <div
        className="block fixed inset-0 cursor-default bg-black/50"
        onClick={() => setIsScriptModal(false)}
      ></div>
      <div
        className="bg-white max-w-xl rounded p-5 absolute top-20 left-1/2 transform -translate-x-1/2
w-[70%] flex flex-col"
      >
        <div className="flex flex-row items-baseline justify-between">
          <h2 className="text-lg font-bold">{currScript.name}</h2>
          <p className="text-slate-600">
            {currScript.script && formatDate(new Date(currScript.start_time))}
          </p>
        </div>
        {currScript.script && (
          <pre className="bg-slate-100 rounded p-4 mt-6 overflow-x-scroll">
            {formatScript(currScript.script)}
          </pre>
        )}
        <button
          className="border border-slate-200 rounded py-3 px-4 text-gray-600 mx-auto mt-4 hover:bg-slate-100 transition"
          onClick={() => {
            setIsScriptModal(false);
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ScriptModal;
