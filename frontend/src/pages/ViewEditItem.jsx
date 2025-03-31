import {useState, useEffect} from "react";
import {axiosInstance} from "../lib/axios";
import {X, Save} from "lucide-react";
import toast from "react-hot-toast";

export default function ViewEditItem({
  itemId,
  isOpen,
  onClose,
  fetchInventory,
}) {
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen && itemId) {
      fetchItemData();
    }
  }, [isOpen, itemId]);

  const fetchItemData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/inventory/getById/${itemId}`);
      // Remove the _id field from the form data as we don't want to edit it
      const {_id, ...formDataWithoutId} = response.data.data;
      setOriginalData(formDataWithoutId);
      setFormData(formDataWithoutId);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      toast.error("Failed to fetch item details");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const {name, value, type, checked} = e.target;

    setFormData((prev) => {
      let newFormData;
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        newFormData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === "checkbox" ? checked : value,
          },
        };
      } else {
        newFormData = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };
      }

      // Trigger checkForChanges after state update
      setTimeout(() => {
        checkForChanges();
      }, 0);

      return newFormData;
    });
  };

  const checkForChanges = () => {
    if (!originalData || !formData) return;

    const compareValues = (value1, value2) => {
      // Handle boolean values
      if (typeof value1 === "boolean" || typeof value2 === "boolean") {
        return value1 === value2;
      }
      // Handle null/undefined values
      if (!value1 && !value2) return true;
      if (!value1 || !value2) return false;
      // Handle arrays (for technologyStack)
      if (Array.isArray(value1) && Array.isArray(value2)) {
        return JSON.stringify(value1.sort()) === JSON.stringify(value2.sort());
      }
      // Handle objects (for nested structures like urls)
      if (typeof value1 === "object" && typeof value2 === "object") {
        return JSON.stringify(value1) === JSON.stringify(value2);
      }
      // Handle regular values
      return String(value1) === String(value2);
    };

    const changesExist = Object.keys(formData).some((key) => {
      if (key === "urls") {
        return Object.keys(formData.urls).some(
          (urlKey) =>
            !compareValues(formData.urls[urlKey], originalData.urls[urlKey])
        );
      }
      return !compareValues(formData[key], originalData[key]);
    });

    setHasChanges(changesExist);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axiosInstance.put(`/inventory/update/${itemId}`, formData);
      toast.success("Item updated successfully");
      await fetchInventory();
      onClose();
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast.error("Failed to update item");
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  if (isLoading || !formData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">View/Edit Inventory Item</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Basic Information
              </h3>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Application ID</span>
                </label>
                <input
                  type="text"
                  name="appId"
                  value={formData.appId || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Application Name</span>
                </label>
                <input
                  type="text"
                  name="applicationName"
                  value={formData.applicationName || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Severity</span>
                </label>
                <select
                  name="severity"
                  value={formData.severity || "Non-Critical"}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="Critical">Critical</option>
                  <option value="Non-Critical">Non-Critical</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Deployment</span>
                </label>
                <select
                  name="deployment"
                  value={formData.deployment || "Onprem"}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="Onprem">On-Prem</option>
                  <option value="DC">DC</option>
                  <option value="DR">DR</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Vendor Site">Vendor Site</option>
                </select>
              </div>
              {formData.deployment === "Cloud" && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Cloud Provider</span>
                  </label>
                  <select
                    name="cloudProvider"
                    value={formData.cloudProvider || ""}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select Provider</option>
                    <option value="Azure">Azure</option>
                    <option value="AWS">AWS</option>
                    <option value="GCP">GCP</option>
                  </select>
                </div>
              )}
              {(formData.deployment === "DC" ||
                formData.deployment === "DR") && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">DC Type</span>
                  </label>
                  <select
                    name="dcType"
                    value={formData.dcType || ""}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select Type</option>
                    <option value="DC">DC</option>
                    <option value="DR">DR</option>
                  </select>
                </div>
              )}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Stage</span>
                </label>
                <select
                  name="stage"
                  value={formData.stage || "Live"}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="Live">Live</option>
                  <option value="Preprod">Preprod</option>
                  <option value="Sunset">Sunset</option>
                  <option value="Decom">Decom</option>
                </select>
              </div>
            </div>

            {/* URLs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">URLs</h3>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">External Prod URL</span>
                </label>
                <input
                  type="text"
                  name="urls.externalProd"
                  value={formData.urls?.externalProd || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">External UAT URL</span>
                </label>
                <input
                  type="text"
                  name="urls.externalUAT"
                  value={formData.urls?.externalUAT || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Internal Prod URL</span>
                </label>
                <input
                  type="text"
                  name="urls.internalProd"
                  value={formData.urls?.internalProd || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Internal UAT URL</span>
                </label>
                <input
                  type="text"
                  name="urls.internalUAT"
                  value={formData.urls?.internalUAT || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">API URL</span>
                </label>
                <input
                  type="text"
                  name="urls.api"
                  value={formData.urls?.api || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            {/* Application Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Application Details
              </h3>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Application Type</span>
                </label>
                <select
                  name="applicationType"
                  value={formData.applicationType || "Business"}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="Business">Business</option>
                  <option value="Infra">Infra</option>
                  <option value="Security">Security</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Developed By</span>
                </label>
                <select
                  name="developedBy"
                  value={formData.developedBy || "In-House"}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="In-House">In-House</option>
                  <option value="OEM">OEM</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Go Live Date</span>
                </label>
                <input
                  type="date"
                  name="goLiveDate"
                  value={formData.goLiveDate?.split("T")[0] || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Availability Rating</span>
                </label>
                <input
                  type="number"
                  name="availabilityRating"
                  min="1"
                  max="4"
                  value={formData.availabilityRating || 1}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Criticality Rating</span>
                </label>
                <input
                  type="number"
                  name="criticalityRating"
                  min="1"
                  max="4"
                  value={formData.criticalityRating || 1}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            {/* Security Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Security Details
              </h3>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">SOC Monitoring</span>
                  <input
                    type="checkbox"
                    name="socMonitoring"
                    checked={formData.socMonitoring || false}
                    onChange={handleChange}
                    className="checkbox"
                  />
                </label>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Endpoint Security</span>
                </label>
                <select
                  name="endpointSecurity"
                  value={formData.endpointSecurity || "NA"}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="NA">NA</option>
                  <option value="HIPS">HIPS</option>
                  <option value="EDR">EDR</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Access Control</span>
                </label>
                <select
                  name="accessControl"
                  value={formData.accessControl || "NA"}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="NA">NA</option>
                  <option value="PAM">PAM</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Manager</span>
                </label>
                <select
                  name="manager"
                  value={formData.manager || "Business"}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="Business">Business</option>
                  <option value="IT">IT</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">VAPT Status</span>
                </label>
                <select
                  name="vaptStatus"
                  value={formData.vaptStatus || "VA"}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="VA">VA</option>
                  <option value="PT">PT</option>
                  <option value="API">API</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Risk Assessment Date</span>
                </label>
                <input
                  type="date"
                  name="riskAssessmentDate"
                  value={formData.riskAssessmentDate?.split("T")[0] || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            {/* Business Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Business Details
              </h3>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Business Owner</span>
                </label>
                <input
                  type="text"
                  name="businessOwner"
                  value={formData.businessOwner || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Business Department Owner</span>
                </label>
                <input
                  type="text"
                  name="businessDeptOwner"
                  value={formData.businessDeptOwner || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Service Type</span>
                </label>
                <input
                  type="text"
                  name="serviceType"
                  value={formData.serviceType || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Service Window</span>
                </label>
                <input
                  type="text"
                  name="serviceWindow"
                  value={formData.serviceWindow || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Business Severity</span>
                </label>
                <input
                  type="text"
                  name="businessSeverity"
                  value={formData.businessSeverity || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Technology Stack</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.technologyStack?.map((tech, index) => (
                    <span key={index} className="badge badge-primary">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Application Description</span>
                </label>
                <textarea
                  name="applicationDescription"
                  value={formData.applicationDescription || ""}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`btn btn-primary ${
                !hasChanges || isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
