import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  createCoupon,
  updateCoupon,
  fetchCoupons,
} from "../../store/slices/couponSlice";
import ModalManager from "./ModalManager"; // Reusing your existing wrapper
import DatePicker from "../common/DatePicker";
import { Loader2, Tag, Percent, Hash } from "lucide-react";
import toast from "react-hot-toast";

const CouponModal = ({ isOpen, onClose, editData }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // Initial State matching backend model
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minPurchaseAmount: 0,
    maxUses: "",
    maxUsesPerUser: 1,
    validFrom: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    validUntil: "",
    isActive: true,
  });

  // Load data for editing
  useEffect(() => {
    if (isOpen && editData) {
      setFormData({
        code: editData.code,
        description: editData.description || "",
        discountType: editData.discountType,
        discountValue: editData.discountValue,
        minPurchaseAmount: editData.minPurchaseAmount || 0,
        maxUses: editData.maxUses || "",
        maxUsesPerUser: editData.maxUsesPerUser || 1,
        validFrom: editData.validFrom
          ? new Date(editData.validFrom).toISOString().split("T")[0]
          : "",
        validUntil: editData.validUntil
          ? new Date(editData.validUntil).toISOString().split("T")[0]
          : "",
        isActive: editData.isActive,
      });
    } else if (isOpen) {
      // Reset for Create mode
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minPurchaseAmount: 0,
        maxUses: "",
        maxUsesPerUser: 1,
        validFrom: new Date().toISOString().split("T")[0],
        validUntil: "",
        isActive: true,
      });
    }
  }, [isOpen, editData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validation
    if (!formData.code || !formData.discountValue || !formData.validUntil) {
      toast.error(
        "Please fill in all required fields (Code, Discount, Expiry)",
      );
      return;
    }

    setLoading(true);
    try {
      if (editData) {
        // Update
        await dispatch(
          updateCoupon({ id: editData._id, data: formData }),
        ).unwrap();
      } else {
        // Create
        await dispatch(createCoupon(formData)).unwrap();
      }
      onClose();
    } catch (error) {
      console.error(error);
      // Toast handled in slice
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalManager
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? "Edit Coupon" : "Create New Coupon"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* ROW 1: Code & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Coupon Code
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "code",
                      value: e.target.value.toUpperCase(),
                    },
                  })
                }
                disabled={!!editData} // Code cannot be changed on edit
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase font-mono tracking-wider ${editData ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "border-slate-300"}`}
                placeholder="Example: SAVE20"
              />
            </div>
            {editData && (
              <p className="text-xs text-slate-400 mt-1">
                Code cannot be changed
              </p>
            )}
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isActive ? "bg-green-500" : "bg-slate-300"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-0"}`}
                />
              </div>
              <span className="text-sm font-medium text-slate-700">
                {formData.isActive ? "Active Status" : "Inactive Status"}
              </span>
            </label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="hidden"
            />
          </div>
        </div>

        {/* ROW 2: Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 20% off for new users"
          />
        </div>

        {/* ROW 3: Discount Logic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Discount Type
            </label>
            <div className="flex bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, discountType: "percentage" })
                }
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.discountType === "percentage" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}
              >
                Percentage (%)
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, discountType: "fixed" })
                }
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.discountType === "fixed" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}
              >
                Fixed Amount (₹)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Discount Value
            </label>
            <div className="relative">
              {formData.discountType === "percentage" ? (
                <Percent className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              ) : (
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                  ₹
                </span>
              )}
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* ROW 4: Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePicker
            label="Valid From"
            name="validFrom"
            value={formData.validFrom}
            onChange={handleChange}
            placeholder="Select start date"
          />
          <DatePicker
            label="Valid Until"
            name="validUntil"
            value={formData.validUntil}
            onChange={handleChange}
            placeholder="Select end date"
            minDate={
              formData.validFrom || new Date().toISOString().split("T")[0]
            }
          />
        </div>

        {/* ROW 5: Usage Limits (Collapsible or visible) */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Min Purchase (₹)
            </label>
            <input
              type="number"
              name="minPurchaseAmount"
              value={formData.minPurchaseAmount}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Total Max Uses
            </label>
            <input
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              placeholder="Unlimited"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Max Per User
            </label>
            <input
              type="number"
              name="maxUsesPerUser"
              value={formData.maxUsesPerUser}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              min="1"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {editData ? "Update Coupon" : "Create Coupon"}
          </button>
        </div>
      </form>
    </ModalManager>
  );
};

export default CouponModal;
