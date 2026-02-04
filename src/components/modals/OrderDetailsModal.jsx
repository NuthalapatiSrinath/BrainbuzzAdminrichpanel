import React from "react";
import ModalManager from "./ModalManager";
import CustomDropdown from "../common/CustomDropdown";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Package,
  Activity,
  Hash,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Receipt,
  FileText,
  ShieldCheck,
} from "lucide-react";

const OrderDetailsModal = ({
  isOpen,
  onClose,
  order,
  onStatusUpdate,
  loading,
}) => {
  if (!order) return null;

  // --- 1. Status Options ---
  const statusOptions = [
    { value: "pending", label: "Pending", icon: Clock },
    { value: "processing", label: "Processing", icon: Activity },
    { value: "completed", label: "Completed", icon: CheckCircle },
    { value: "failed", label: "Failed", icon: XCircle },
    { value: "cancelled", label: "Cancelled", icon: XCircle },
    { value: "refunded", label: "Refunded", icon: AlertCircle },
  ];

  // --- 2. Helper: Currency Formatter ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: order.currency || "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // --- 3. Helper: Gateway Status Color ---
  const getGatewayStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "paid" || s === "captured")
      return "text-green-700 bg-green-50 border-green-200";
    if (s === "created" || s === "attempted")
      return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-slate-700 bg-slate-50 border-slate-200";
  };

  return (
    <ModalManager
      isOpen={isOpen}
      onClose={onClose}
      title="Order Details"
      size="xl"
    >
      <div className="p-6 space-y-8 bg-slate-50/30 min-h-[60vh]">
        {/* ================= SECTION 1: HEADER CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Order ID */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-indigo-500" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Order ID
              </span>
            </div>
            <p
              className="text-sm font-bold text-slate-900 truncate"
              title={order.orderId}
            >
              {order.orderId}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-mono">DB:</span>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 rounded truncate max-w-full">
                {order._id}
              </span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-green-300 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Amount
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {formatCurrency(order.amount)}
            </p>
          </div>

          {/* Created At */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Created At
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {new Date(order.createdAt).toLocaleDateString("en-GB")}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>

          {/* Gateway Status */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Gateway Status
              </span>
            </div>
            <div
              className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-bold capitalize ${getGatewayStatusColor(order.paymentDetails?.status)}`}
            >
              {order.paymentDetails?.status || "Unknown"}
            </div>
          </div>

          {/* Currency */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-300 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-teal-500" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Currency
              </span>
            </div>
            <p className="text-xl font-black text-slate-900">
              {order.currency || "INR"}
            </p>
          </div>
        </div>

        {/* ================= SECTION 2: CUSTOMER & STATUS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Card */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Customer Information
              </h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Full Name
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {order.user?.firstName} {order.user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  User ID
                </p>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono select-all">
                  {order.user?._id}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-[-4px]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                    Email Address
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {order.user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-[-4px]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                    Mobile Number
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {order.user?.mobileNumber || "N/A"}
                  </p>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                  Order Timeline
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-slate-500 font-medium">Created:</span>
                    <span className="font-bold text-slate-700">
                      {new Date(order.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-slate-500 font-medium">Updated:</span>
                    <span className="font-bold text-slate-700">
                      {new Date(order.updatedAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manage Status Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Manage Status
              </h3>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center">
              <div className="mb-4 relative z-50">
                {/* z-50 ensures dropdown floats above everything */}
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">
                  Current Order Status
                </label>
                <CustomDropdown
                  label=""
                  value={order.status}
                  onChange={(newValue) => onStatusUpdate(order._id, newValue)}
                  options={statusOptions}
                  icon={Activity}
                  disabled={loading}
                />
              </div>

              <div className="mt-auto bg-blue-50 text-blue-700 p-3 rounded-lg flex gap-3 items-start border border-blue-100">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs leading-relaxed font-medium">
                  Status updates reflect immediately on the student's dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 3: PURCHASED ITEMS ================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Purchased Items
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/30 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Item Details</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-center">Qty</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm mb-1">
                        {/* Use itemDetails if available, else show warning with ID */}
                        {item.itemDetails?.name || (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Item Deleted or Unavailable
                          </span>
                        )}
                      </p>
                      {item.itemDetails?.description && (
                        <p className="text-xs text-slate-500 mb-1.5 line-clamp-1">
                          {item.itemDetails.description}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        ID: {item.itemId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${item.itemType?.toLowerCase() === "course" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-purple-50 text-purple-700 border border-purple-100"}`}
                      >
                        {item.itemType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                {order.coupon && order.coupon.code && (
                  <tr className="border-b border-slate-100">
                    <td
                      colSpan="4"
                      className="px-6 py-3 text-right text-slate-500 font-bold uppercase text-xs"
                    >
                      <div className="flex items-center justify-end gap-2">
                        <span>Coupon Applied</span>
                        <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-mono font-bold border border-green-200">
                          {order.coupon.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-green-600">
                      -
                      {order.coupon.discountType === "percentage"
                        ? `${order.coupon.discountValue}%`
                        : formatCurrency(order.coupon.discountValue)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-right text-slate-500 font-bold uppercase text-xs"
                  >
                    Grand Total
                  </td>
                  <td className="px-6 py-4 text-right font-black text-indigo-600 text-xl">
                    {formatCurrency(order.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ================= SECTION 4: PAYMENT DETAILS (Mapped from your JSON) ================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Payment Gateway Information
            </h3>
          </div>

          <div className="p-6">
            {/* Based on your JSON data availability */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Razorpay Payment ID */}
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Transaction Ref (Payment ID)
                </p>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  <span className="font-mono text-sm font-medium text-slate-700 select-all">
                    {order.paymentId || "N/A"}
                  </span>
                </div>
              </div>

              {/* 2. Razorpay Order ID */}
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Gateway Order ID
                </p>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="font-mono text-sm font-medium text-slate-700 select-all">
                    {order.paymentDetails?.id || "N/A"}
                  </span>
                </div>
              </div>

              {/* 3. Receipt No */}
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Receipt Number
                </p>
                <span className="text-sm font-bold text-slate-800">
                  {order.paymentDetails?.receipt || "N/A"}
                </span>
              </div>

              {/* 4. Notes (Coupon) */}
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Coupon Used
                </p>
                {order.coupon?.code ||
                order.paymentDetails?.notes?.couponCode ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-sm font-bold border border-green-200">
                    <CheckCircle className="w-3 h-3" />
                    {order.coupon?.code ||
                      order.paymentDetails?.notes?.couponCode}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-slate-400">
                    None
                  </span>
                )}
              </div>

              {/* 5. Notes (Amount in Rupees) */}
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Verified Amount (INR)
                </p>
                <span className="text-sm font-bold text-slate-700">
                  ₹
                  {order.paymentDetails?.notes?.amountInRupees ||
                    order.paymentDetails?.amount / 100}
                </span>
              </div>

              {/* 6. Created At (Gateway) */}
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Gateway Time
                </p>
                <span className="text-sm font-medium text-slate-600">
                  {order.paymentDetails?.created_at
                    ? new Date(
                        order.paymentDetails.created_at * 1000,
                      ).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 5: ADDRESS INFORMATION (IF AVAILABLE) ================= */}
        {(order.shippingAddress || order.billingAddress) && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Address Information
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {order.shippingAddress && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">
                    Shipping Address
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                      {typeof order.shippingAddress === "string"
                        ? order.shippingAddress
                        : JSON.stringify(order.shippingAddress, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              {order.billingAddress && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">
                    Billing Address
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                      {typeof order.billingAddress === "string"
                        ? order.billingAddress
                        : JSON.stringify(order.billingAddress, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </ModalManager>
  );
};

export default OrderDetailsModal;
