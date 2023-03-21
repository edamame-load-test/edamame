// Create hover and click states
// Add link to the user's AWS account
// Center the icon vertically
import { FiExternalLink } from "react-icons/fi";

function TopBar() {
  return (
    <div className="bg-green-900 text-white font-weight-500 flex antialiased py-1 border-b border-green-400">
      <div className="py-3 px-5 flex items-center justify-between w-full">
        <p className="font-medium absolute">Edamame</p>
        <p className="mx-auto">
          Success! Your EKS cluster is running on your AWS account.
        </p>
        <div className="flex gap-4 items-center absolute right-4">
          <button className="flex gap-1 hover:underline">
            See on AWS <FiExternalLink />
          </button>
          <button className="border border-white rounded px-3 py-[8px]">
            Delete Cluster
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
