import testService from "../services/testService";

function Menu({ test, setMenu, tests, setTests, setIsScriptModal, setCurrScript, setIsArchiveModal, setArchiveTestName }) {
  async function handleScript() {
    setIsScriptModal(true);
    setMenu(false);
    setCurrScript(test);
  }

  async function handleArchive() {
    setIsArchiveModal(true);
    setMenu(false);
    setArchiveTestName(test.name);
  }

  async function handleDelete() {
    await testService.deleteTest(test.name);
    const newTestList = tests.filter(aTest => aTest.name !== test.name);
    setTests(newTestList);
    setMenu(false);
  }

  return (
    <>
      <div
        className="inset-0 bg-white opacity-0 absolute"
        onClick={() => setMenu(null)}
      ></div>
      <div
        className="flex flex-col bg-white border border-slate-100 shadow-md whitespace-nowrap py-1 rounded absolute z-40"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          onClick={handleScript}
          className="hover:cursor-pointer hover:bg-slate-100 pl-4 py-2 pr-16"
        >
          See script
        </p>
        <p
          onClick={handleArchive}
          className="hover:cursor-pointer hover:bg-slate-100 pl-4 py-2 pr-16"
        >
          Archive
        </p> 
        <p
          className="text-pink hover:cursor-pointer pl-4 pr-16 hover:bg-pink/10 py-2"
          onClick={handleDelete}
        >
          Delete
        </p>
      </div>
    </>
  );
}

export default Menu;
