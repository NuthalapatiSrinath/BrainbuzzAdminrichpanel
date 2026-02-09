import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  Globe,
  Loader2,
  Layers,
  Calendar,
  Newspaper,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/common/SearchBar";
import GenericModal from "../../components/modals/GenericModal";
import CurrentAffairsModal from "../../components/modals/CurrentAffairsModal";

// Actions
import {
  fetchCurrentAffairs,
  createCurrentAffair,
  updateCurrentAffair,
  deleteCurrentAffair,
  fetchCATypes,
  createCAType,
  updateCAType,
  deleteCAType,
  toggleCATypeStatus,
} from "../../store/slices/currentAffairsSlice";

const CurrentAffairsManager = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("content"); // 'content' or 'types'

  // Redux
  const {
    items: affairs,
    types,
    loading,
  } = useSelector((state) => state.currentAffairs);

  // Local State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'content' or 'type'
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchCurrentAffairs({}));
    dispatch(fetchCATypes());
  }, [dispatch]);

  // Handlers
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleContentSubmit = async (data) => {
    try {
      if (selectedItem) {
        await dispatch(
          updateCurrentAffair({ id: selectedItem._id, data }),
        ).unwrap();
      } else {
        await dispatch(createCurrentAffair(data)).unwrap();
        // Refresh to get populated category/subcategory/language data
        await dispatch(fetchCurrentAffairs({})).unwrap();
      }
      toast.success("Saved successfully");
      setModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      toast.error(err || "Operation failed");
    }
  };

  const handleTypeSubmit = async (data) => {
    try {
      // API expects { categoryType, description, thumbnail }
      const payload = new FormData();
      payload.append("categoryType", data.name); // Mapping GenericModal 'name' to 'categoryType'
      if (data.description) payload.append("description", data.description);
      if (data.thumbnail) payload.append("thumbnail", data.thumbnail);

      if (selectedItem) {
        await dispatch(
          updateCAType({ id: selectedItem._id, data: payload }),
        ).unwrap();
      } else {
        await dispatch(createCAType(payload)).unwrap();
      }
      toast.success("Category saved");
      setModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      toast.error(err || "Operation failed");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      type === "content"
        ? await dispatch(deleteCurrentAffair(id)).unwrap()
        : await dispatch(deleteCAType(id)).unwrap();
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await dispatch(
        toggleCATypeStatus({ id, isActive: !currentStatus }),
      ).unwrap();
      toast.success(`Status ${!currentStatus ? "activated" : "deactivated"}`);
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  // Filtering
  const filteredAffairs = useMemo(() => {
    if (!search) return affairs;
    return affairs.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [affairs, search]);

  const filteredTypes = useMemo(() => {
    if (!search) return types;
    return types.filter((t) =>
      t.categoryType.toLowerCase().includes(search.toLowerCase()),
    );
  }, [types, search]);

  // Table Columns
  const contentColumns = [
    {
      header: "Current Affair",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.thumbnailUrl ? (
            <img
              src={row.thumbnailUrl}
              className="w-10 h-10 rounded-lg object-cover"
              alt=""
            />
          ) : (
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
              <Newspaper className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="font-bold text-slate-800">{row.name}</p>
            <p className="text-xs text-slate-500">
              {row.category?.name || row.category?.categoryType} •{" "}
              {new Date(row.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Exam Category",
      accessor: "categories",
      render: (row) => (
        <span className="text-xs bg-slate-100 px-2 py-1 rounded font-medium text-slate-600">
          {row.categories?.[0]?.name || "-"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <span
          className={`text-xs font-bold px-2 py-1 rounded ${row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "_id",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openModal("content", row)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete("content", row._id)}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const typeColumns = [
    {
      header: "Type Name",
      accessor: "categoryType",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.thumbnailUrl ? (
            <img
              src={row.thumbnailUrl}
              className="w-10 h-10 rounded-lg object-cover"
              alt=""
            />
          ) : (
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
              <Layers className="w-5 h-5" />
            </div>
          )}
          <div>
            <span className="font-bold text-slate-800 capitalize">
              {row.categoryType}
            </span>
            {row.description && (
              <p className="text-xs text-slate-500 mt-0.5">{row.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row._id, row.isActive)}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
            row.isActive
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      header: "Actions",
      accessor: "_id",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openModal("type", row)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete("type", row._id)}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="flex p-1 bg-slate-100 dark:bg-gray-700 rounded-xl overflow-x-auto w-full xl:w-auto">
          {["content", "types"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {tab === "content" ? "Current Affairs" : "CA Types"}
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full xl:w-auto justify-end px-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search..."
          />
          <button
            onClick={() =>
              openModal(activeTab === "content" ? "content" : "type")
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-5 h-5" /> Add New
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <DataTable
            columns={activeTab === "content" ? contentColumns : typeColumns}
            data={activeTab === "content" ? filteredAffairs : filteredTypes}
            hideSearch={true}
          />
        )}
      </div>

      {/* Modals */}
      {modalType === "content" && (
        <CurrentAffairsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleContentSubmit}
          initialData={selectedItem}
          types={types}
        />
      )}
      {modalType === "type" && (
        <GenericModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleTypeSubmit}
          initialData={
            selectedItem
              ? { ...selectedItem, name: selectedItem.categoryType }
              : null
          }
          title={`${selectedItem ? "Edit" : "Add"} CA Category`}
          fields={[
            {
              name: "name",
              label: "Category Type (e.g. Sports)",
              type: "text",
              required: true,
            },
            { name: "description", label: "Description", type: "textarea" },
            {
              name: "thumbnail",
              label: "Thumbnail",
              type: "file",
              previewKey: "thumbnailUrl",
            },
          ]}
        />
      )}
    </div>
  );
};

export default CurrentAffairsManager;
