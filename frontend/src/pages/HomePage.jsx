import {useState, useEffect} from "react";
import axios from "axios";
import {Trash2, Filter, Eye, Plus, ArrowRight} from "lucide-react";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import AddItem from "./AddItem";
import ViewEditItem from "./ViewEditItem";
import {axiosInstance} from "../lib/axios";

export default function InventoryManagement() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [receiverMail, setReceiverMail] = useState("");
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [currentViewItemId, setCurrentViewItemId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemAppId, setDeleteItemAppId] = useState(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    search: "",
    severity: "",
    stage: "",
    applicationType: "",
    deployment: "",
  });
  const [inventory, setInventory] = useState([
    {
      _id: "",
      appId: "NA",
      applicationName: "NA",
      urls: {
        externalProd: "NA",
        externalUAT: "NA",
        internalProd: "NA",
        internalUAT: "NA",
        api: "NA",
      },
      severity: "NA",
      deployment: "NA",
      cloudProvider: "NA",
      dcType: "NA",
      stage: "NA",
      publish: "NA",
      availabilityRating: "NA",
      criticalityRating: "NA",
      goLiveDate: "NA",
      applicationType: "NA",
      developedBy: "NA",
      socMonitoring: false,
      endpointSecurity: "NA",
      accessControl: "NA",
      manager: "NA",
      vaptStatus: "NA",
      riskAssessmentDate: "NA",
      smtpEnabled: false,
      businessOwner: "NA",
      businessDeptOwner: "NA",
      serviceType: "NA",
      serviceWindow: "NA",
      businessSeverity: "NA",
      technologyStack: ["NA"],
      applicationDescription: "NA",
    },
  ]);

  const fetchInventory = async () => {
    try {
      // Build query string from searchParams
      const queryString = new URLSearchParams(
        Object.fromEntries(
          Object.entries(searchParams).filter(([_, value]) => value)
        )
      ).toString();

      const response = await axiosInstance.get(
        `/inventory/get/all?${queryString}`
      );
      setInventory(response.data.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch inventory items");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [searchParams]);

  const handleView = (item) => {
    console.log("View item:", item); // For debugging
    setCurrentViewItemId(item._id || item._id.$oid); // Handle both formats
    setViewModalOpen(true);
  };

  const confirmDelete = (item) => {
    // Make sure we're getting the string ID
    console.log("Delete item:", item); // For debugging
    setDeleteItemId(item._id.$oid || item._id); // Handle both formats
    setDeleteItemAppId(item.appId);
    setDeleteModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Invalid item ID");
      return;
    }

    try {
      console.log("Deleting item with ID:", id); // For debugging
      await axiosInstance.delete(`/inventory/delete/${id}`);
      toast.success("Item deleted successfully");
      fetchInventory();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting inventory:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleFilterChange = (e) => {
    const {name, value} = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMailSend = async () => {
    setIsSendingMail(true);
    try {
      const res = await axiosInstance.post(
        "/api/send-report",
        filteredInventory
      );
    } catch (error) {
    } finally {
      setIsSendingMail(false);
    }
  };

  const filteredInventory = Array.isArray(inventory)
    ? inventory.filter(
        (item) =>
          (!filters.severity || item.severity === filters.severity) &&
          (!filters.deployment || item.deployment === filters.deployment) &&
          (!filters.stage || item.stage === filters.stage) &&
          (!filters.publish || item.publish === filters.publish) &&
          (!filters.applicationType ||
            item.applicationType === filters.applicationType) &&
          (!filters.developedBy || item.developedBy === filters.developedBy) &&
          (!filters.cloudProvider ||
            item.cloudProvider === filters.cloudProvider) &&
          (!filters.dcType || item.dcType === filters.dcType) &&
          (!filters.manager || item.manager === filters.manager) &&
          (!filters.vaptStatus || item.vaptStatus === filters.vaptStatus) &&
          (!filters.endpointSecurity ||
            item.endpointSecurity === filters.endpointSecurity) &&
          (!filters.accessControl ||
            item.accessControl === filters.accessControl) &&
          (!filters.socMonitoring ||
            item.socMonitoring === (filters.socMonitoring === "true")) &&
          (!filters.smtpEnabled ||
            item.smtpEnabled === (filters.smtpEnabled === "true")) &&
          (!search ||
            item.applicationName.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg w-64 p-4 space-y-4 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300`}
      >
        <h3 className="text-lg font-semibold">Filters</h3>

        {/* Basic Filters */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search by name..."
            name="search"
            value={searchParams.search}
            onChange={handleFilterChange}
            className="input input-bordered w-full"
          />

          <select
            name="severity"
            onChange={handleFilterChange}
            value={searchParams.severity}
            className="select select-bordered w-full"
          >
            <option value="">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="Non-Critical">Non-Critical</option>
          </select>

          <select
            name="stage"
            onChange={handleFilterChange}
            value={searchParams.stage}
            className="select select-bordered w-full"
          >
            <option value="">All Stages</option>
            <option value="Live">Live</option>
            <option value="Preprod">Preprod</option>
            <option value="Sunset">Sunset</option>
            <option value="Decom">Decom</option>
          </select>

          <select
            name="applicationType"
            onChange={handleFilterChange}
            value={searchParams.applicationType}
            className="select select-bordered w-full"
          >
            <option value="">All Types</option>
            <option value="Business">Business</option>
            <option value="Infra">Infrastructure</option>
            <option value="Security">Security</option>
          </select>

          <select
            name="deployment"
            onChange={handleFilterChange}
            value={searchParams.deployment}
            className="select select-bordered w-full"
          >
            <option value="">All Deployments</option>
            <option value="Onprem">On-Prem</option>
            <option value="Cloud">Cloud</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <button
            onClick={() =>
              setSearchParams({
                search: "",
                severity: "",
                stage: "",
                applicationType: "",
                deployment: "",
              })
            }
            className="btn btn-outline w-full"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:ml-64">
        <h1 className="text-xl font-bold mb-5">
          SUD Software Inventory Manager
        </h1>
        <button
          onClick={() => setSidebarOpen(true)}
          className="btn btn-primary mb-4 md:hidden"
        >
          <Filter size={18} /> Filters
        </button>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full"
          />
          <button onClick={handleAdd} className="btn btn-primary">
            <Plus size={18} /> Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-100 text-sm md:text-base">
                <th>App ID</th>
                <th>App Name</th>
                <th className="hidden md:table-cell">Severity</th>
                <th className="hidden sm:table-cell">Deployment</th>
                <th className="">Stage</th>
                <th className="hidden lg:table-cell">App Type</th>
                <th className="hidden sm:table-cell">Service Type</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item._id} className="border-t text-sm md:text-base">
                  <td>{item.appId}</td>
                  <td>{item.applicationName}</td>
                  <td className="hidden md:table-cell">{item.severity}</td>
                  <td className="hidden sm:table-cell">{item.deployment}</td>
                  <td>{item.stage}</td>
                  <td className="hidden lg:table-cell">
                    {item.applicationType}
                  </td>
                  <td className="hidden sm:table-cell">{item.serviceType}</td>
                  <td className="text-right">
                    <div className="flex flex-row justify-end">
                      <button
                        onClick={() => handleView(item)}
                        className="btn btn-outline btn-sm lg:mx-2 sm:mx-1"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(item)}
                        className="btn btn-outline btn-sm text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-opacity-75 bg-base-100 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Do you want to delete the item with ID: {deleteItemAppId}?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => handleDelete(deleteItemId)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddItem
          isOpen={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
          fetchInventory={fetchInventory}
        />
      )}

      {isViewModalOpen && (
        <ViewEditItem
          itemId={currentViewItemId}
          isOpen={isViewModalOpen}
          onClose={() => setViewModalOpen(false)}
          fetchInventory={fetchInventory}
        />
      )}
    </div>
  );
}
