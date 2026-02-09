import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import publicationService from "../../../api/publicationService";

const PricingModal = ({ isOpen, onClose, onSuccess, publicationData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    originalPrice: "",
    discountPrice: "",
    pricingNote: "",
  });

  useEffect(() => {
    if (isOpen && publicationData) {
      setFormData({
        originalPrice: publicationData.originalPrice || "",
        discountPrice: publicationData.discountPrice || "",
        pricingNote: publicationData.pricingNote || "",
      });
    }
  }, [isOpen, publicationData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!publicationData?._id) {
      toast.error("Publication ID is required");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating pricing...");

    try {
      const response = await publicationService.updatePricing(
        publicationData._id,
        formData,
      );
      toast.success("Pricing updated successfully!", { id: loadingToast });
      if (onSuccess) onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Update failed", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6" />
            <h2 className="text-xl font-bold">Update Pricing</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Original Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="w-full border p-2.5 pl-8 rounded-xl outline-none focus:border-green-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Discount Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    className="w-full border p-2.5 pl-8 rounded-xl outline-none focus:border-green-500"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Pricing Note
              </label>
              <textarea
                name="pricingNote"
                value={formData.pricingNote}
                onChange={handleChange}
                rows="3"
                placeholder="Any special notes about pricing..."
                className="w-full border p-2.5 rounded-xl outline-none focus:border-green-500"
              />
            </div>

            {/* Price Summary */}
            {formData.originalPrice && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="text-sm font-bold text-green-800 mb-2">
                  Price Summary
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Original Price:</span>
                    <span className="font-bold">₹{formData.originalPrice}</span>
                  </div>
                  {formData.discountPrice && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Discount Price:</span>
                        <span className="font-bold text-green-600">
                          ₹{formData.discountPrice}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-slate-600">You Save:</span>
                        <span className="font-bold text-green-700">
                          ₹{formData.originalPrice - formData.discountPrice} (
                          {(
                            ((formData.originalPrice - formData.discountPrice) /
                              formData.originalPrice) *
                            100
                          ).toFixed(0)}
                          %)
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-lg flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Update Pricing
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PricingModal;
