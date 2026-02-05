import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  Video,
  Loader2,
  Calendar,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  FolderTree,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/common/SearchBar";
import LiveClassModal from "../../components/modals/LiveClassModal";
import GenericModal from "../../components/modals/GenericModal";

// Actions
import {
  fetchLiveClasses,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
  toggleLiveClassStatus,
} from "../../store/slices/liveClassSlice";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../store/slices/categorySlice";
import {
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../../store/slices/subCategorySlice";

const LIVE_CLASS_CONTENT_TYPE = "LIVE_CLASS";

const LiveClassManager = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("classes"); // 'classes' or 'classification'

  // --- REDUX DATA ---
  const { items: liveClasses, loading: classLoading } = useSelector(
    (state) => state.liveClasses,
  );
  const { categories, loading: catLoading } = useSelector(
    (state) => state.category,
  );
  const { subCategories, loading: subLoading } = useSelector(
    (state) => state.subCategory,
  );

  // --- LOCAL STATE ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'liveClass', 'category', 'subcategory'
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [targetParentId, setTargetParentId] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    dispatch(fetchLiveClasses({}));
    dispatch(fetchCategories({ contentType: LIVE_CLASS_CONTENT_TYPE }));
    dispatch(fetchSubCategories({ contentType: LIVE_CLASS_CONTENT_TYPE }));
  }, [dispatch]);

  // --- HELPERS ---
  const toggleExpand = (catId) =>
    setExpandedCategories((p) => ({ ...p, [catId]: !p[catId] }));

  const groupedSubCategories = useMemo(() => {
    const grouped = {};
    subCategories.forEach((sub) => {
      const catId = sub.category?._id || sub.category;
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(sub);
    });
    return grouped;
  }, [subCategories]);

  // --- FILTERS ---
  const filteredClasses = useMemo(() => {
    if (!search) return liveClasses;
    return liveClasses.filter((lc) =>
      lc.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [liveClasses, search]);

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [categories, search]);

  const filteredSubCategories = useMemo(() => {
    if (!search) return groupedSubCategories;
    const s = search.toLowerCase();
    const filtered = {};
    Object.keys(groupedSubCategories).forEach((catId) => {
      const matchingSubs = groupedSubCategories[catId].filter((sub) =>
        sub.name.toLowerCase().includes(s),
      );
      if (matchingSubs.length > 0) filtered[catId] = matchingSubs;
    });
    return filtered;
  }, [groupedSubCategories, search]);

  // --- HANDLERS ---
  const openModal = (type, parentId = null, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (parentId) setTargetParentId(parentId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setTargetParentId(null);
  };

  const handleCreate = async (data) => {
    try {
      if (modalType === "liveClass")
        await dispatch(createLiveClass(data)).unwrap();
      else if (modalType === "category")
        await dispatch(
          createCategory({ ...data, contentType: LIVE_CLASS_CONTENT_TYPE }),
        ).unwrap();
      else if (modalType === "subcategory") {
        const payload = targetParentId
          ? { ...data, category: targetParentId }
          : data;
        await dispatch(createSubCategory(payload)).unwrap();
      }
      toast.success(
        `${modalType === "liveClass" ? "Class" : modalType} created successfully`,
      );
      closeModal();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Operation failed");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const id = selectedItem._id;
      if (modalType === "liveClass")
        await dispatch(updateLiveClass({ id, data })).unwrap();
      else if (modalType === "category")
        await dispatch(updateCategory({ id, formData: data })).unwrap();
      else if (modalType === "subcategory")
        await dispatch(updateSubCategory({ id, formData: data })).unwrap();
      toast.success("Updated successfully");
      closeModal();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      if (type === "liveClass") await dispatch(deleteLiveClass(id)).unwrap();
      else if (type === "category") await dispatch(deleteCategory(id)).unwrap();
      else if (type === "subcategory")
        await dispatch(deleteSubCategory(id)).unwrap();
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await dispatch(
        toggleLiveClassStatus({ id, isActive: !currentStatus }),
      ).unwrap();
      toast.success(`Class ${!currentStatus ? "Activated" : "Deactivated"}`);
    } catch (e) {
      toast.error("Status update failed");
    }
  };

  // --- MODAL CONFIG (Categories) ---
  const getModalConfig = () => {
    if (modalType === "category" || modalType === "subcategory") {
      return [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "thumbnail",
          label: "Thumbnail",
          type: "file",
          previewKey: "thumbnailUrl",
        },
      ];
    }
    return [];
  };

  // --- COLUMNS ---
  const columns = [
    {
      header: "Live Class",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.thumbnail ? (
            <img
              src={row.thumbnail}
              className="w-16 h-10 rounded-lg object-cover border border-slate-200"
              alt=""
            />
          ) : (
            <div className="w-16 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
              <Video className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="font-bold text-slate-800">{row.name}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />{" "}
              {new Date(row.dateTime).toLocaleString()}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "categoryId",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">
            {row.categoryId?.name || "-"}
          </span>
          <span className="text-[10px] text-slate-500">
            {row.subCategoryId?.name || "-"}
          </span>
        </div>
      ),
    },
    {
      header: "Video Link",
      accessor: "videoLink",
      render: (row) => (
        <a
          href={row.videoLink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
        >
          <ExternalLink className="w-3 h-3" /> Join Link
        </a>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row._id, row.isActive)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {row.isActive ? (
            <>
              <Eye className="w-3 h-3" /> Active
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" /> Inactive
            </>
          )}
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
            onClick={() => openModal("liveClass", null, row)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete("liveClass", row._id)}
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
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="flex p-1 bg-slate-100 dark:bg-gray-700 rounded-xl overflow-x-auto w-full xl:w-auto">
          {["classes", "classification"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "classes" ? "Live Classes" : "Classifications"}
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
              openModal(activeTab === "classes" ? "liveClass" : "category")
            }
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition-all"
          >
            <Plus className="w-5 h-5" /> Add New
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
        {/* TAB 1: LIVE CLASSES */}
        {activeTab === "classes" && (
          <>
            {classLoading ? (
              <div className="flex justify-center items-center h-96 text-rose-600">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            ) : (
              <DataTable columns={columns} data={filteredClasses} hideSearch />
            )}
          </>
        )}

        {/* TAB 2: CLASSIFICATION (Categories & Subcategories) */}
        {activeTab === "classification" && (
          <div className="p-6 animate-in fade-in">
            {catLoading || subLoading ? (
              <div className="flex justify-center items-center h-64 text-indigo-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                  <div
                    key={category._id}
                    className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow duration-300 overflow-hidden group"
                  >
                    <div className="p-5 flex items-start justify-between bg-slate-50/50">
                      <div
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => toggleExpand(category._id)}
                      >
                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm text-indigo-500">
                          <Layers className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">
                            {category.name}
                          </h3>
                          <p className="text-xs font-medium text-slate-500 uppercase">
                            {(search
                              ? filteredSubCategories[category._id]?.length
                              : groupedSubCategories[category._id]?.length) ||
                              0}{" "}
                            Subcategories
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal("category", null, category)}
                          className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete("category", category._id)}
                          className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <button
                        onClick={() => toggleExpand(category._id)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 mt-2 mb-3 transition-colors w-full"
                      >
                        <ChevronRight
                          className={`w-3 h-3 transition-transform ${expandedCategories[category._id] ? "rotate-90" : ""}`}
                        />
                        {expandedCategories[category._id] ? "Hide" : "Show"}{" "}
                        Subcategories
                      </button>
                      {expandedCategories[category._id] && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          {(search
                            ? filteredSubCategories[category._id]
                            : groupedSubCategories[category._id]
                          )?.map((sub) => (
                            <div
                              key={sub._id}
                              className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 group/sub transition-colors"
                            >
                              <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <FolderTree className="w-3 h-3 text-slate-400" />{" "}
                                {sub.name}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    openModal("subcategory", null, sub)
                                  }
                                  className="p-1 text-slate-400 hover:text-indigo-600"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete("subcategory", sub._id)
                                  }
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() =>
                              openModal("subcategory", category._id)
                            }
                            className="w-full py-2 mt-2 text-xs font-bold text-indigo-600 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Subcategory
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {modalType === "liveClass" ? (
        <LiveClassModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={selectedItem ? handleUpdate : handleCreate}
          initialData={selectedItem}
        />
      ) : (
        <GenericModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={selectedItem ? handleUpdate : handleCreate}
          initialData={selectedItem}
          title={`${selectedItem ? "Edit" : "Add"} ${modalType === "category" ? "Category" : "Subcategory"}`}
          fields={getModalConfig()}
        />
      )}
    </div>
  );
};

export default LiveClassManager;
