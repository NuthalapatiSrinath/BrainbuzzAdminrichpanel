import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Loader2,
  Download,
  Eye,
  EyeOff,
  Layers,
  FolderTree,
  ChevronRight,
  Calendar,
  FileText,
  Globe,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Components
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/common/SearchBar";
import GenericModal from "../../components/modals/GenericModal";
import EBookModal from "../../components/modals/EBookModal";

// Actions
import {
  fetchEBooks,
  createEBook,
  updateEBook,
  deleteEBook,
} from "../../store/slices/eBookSlice";
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

const EBOOK_CONTENT_TYPE = "E_BOOK";

const EBookManager = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("ebooks");

  // --- REDUX DATA ---
  const { items: ebooks, loading: ebookLoading } = useSelector(
    (state) => state.ebooks,
  );
  const { categories, loading: catLoading } = useSelector(
    (state) => state.category,
  );
  const { subCategories, loading: subLoading } = useSelector(
    (state) => state.subCategory,
  );

  // --- LOCAL STATE ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'ebook', 'category', 'subcategory'
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [targetParentId, setTargetParentId] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    dispatch(fetchEBooks({}));
    dispatch(fetchCategories({ contentType: EBOOK_CONTENT_TYPE }));
    dispatch(fetchSubCategories({ contentType: EBOOK_CONTENT_TYPE }));
  }, [dispatch]);

  // --- HELPERS ---
  const toggleExpand = (catId) =>
    setExpandedCategories((p) => ({ ...p, [catId]: !p[catId] }));

  // Group subcategories by parent category ID
  const groupedSubCategories = useMemo(() => {
    const grouped = {};
    subCategories.forEach((sub) => {
      const catId = sub.category?._id || sub.category;
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(sub);
    });
    return grouped;
  }, [subCategories]);

  // --- DOWNLOAD HANDLER ---
  const handleDownload = async (url, filename) => {
    if (!url) return toast.error("No file available to download");
    try {
      const toastId = toast.loading("Downloading...");
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || url.split("/").pop() || "ebook.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.dismiss(toastId);
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.dismiss();
      toast.error("Opening in new tab...");
      window.open(url, "_blank");
    }
  };

  // --- FILTERING ---
  const filteredEBooks = useMemo(() => {
    if (!search) return ebooks;
    const s = search.toLowerCase();
    return ebooks.filter((ebook) => ebook.name.toLowerCase().includes(s));
  }, [ebooks, search]);

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const s = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(s));
  }, [categories, search]);

  const filteredSubCategories = useMemo(() => {
    if (!search) return groupedSubCategories;
    const s = search.toLowerCase();
    const filtered = {};
    Object.keys(groupedSubCategories).forEach((catId) => {
      const matchingSubs = groupedSubCategories[catId].filter((sub) =>
        sub.name.toLowerCase().includes(s),
      );
      if (matchingSubs.length > 0) {
        filtered[catId] = matchingSubs;
      }
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
      if (modalType === "ebook") {
        await dispatch(createEBook(data)).unwrap();
      } else if (modalType === "category") {
        await dispatch(
          createCategory({ ...data, contentType: EBOOK_CONTENT_TYPE }),
        ).unwrap();
      } else if (modalType === "subcategory") {
        const payload = targetParentId
          ? { ...data, category: targetParentId }
          : data;
        await dispatch(createSubCategory(payload)).unwrap();
      }
      toast.success(`${modalType} created successfully`);
      closeModal();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Operation failed");
    }
  };

  const handleUpdate = async (data) => {
    // Handle refresh-only requests from modal
    if (data._refreshOnly) {
      if (modalType === "ebook") await dispatch(fetchEBooks({}));
      return;
    }

    try {
      const id = selectedItem._id;
      if (modalType === "ebook") {
        if (data._isEdit) delete data._isEdit;
        await dispatch(updateEBook({ id, data })).unwrap();
      } else if (modalType === "category") {
        await dispatch(updateCategory({ id, formData: data })).unwrap();
      } else if (modalType === "subcategory") {
        await dispatch(updateSubCategory({ id, formData: data })).unwrap();
      }
      toast.success("Updated successfully");
      closeModal();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;
    try {
      if (type === "ebook") await dispatch(deleteEBook(id)).unwrap();
      else if (type === "category") await dispatch(deleteCategory(id)).unwrap();
      else if (type === "subcategory")
        await dispatch(deleteSubCategory(id)).unwrap();
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // --- MODAL CONFIG ---
  const getModalConfig = () => {
    if (modalType === "category" || modalType === "subcategory") {
      return [
        {
          name: "name",
          label:
            modalType === "category" ? "Category Name" : "SubCategory Name",
          type: "text",
          required: true,
        },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "thumbnail",
          label: "Thumbnail Image",
          type: "file",
          accept: "image/*",
          previewKey: "thumbnailUrl",
        },
      ];
    }
    return [];
  };

  // --- COLUMNS ---
  const ebookColumns = useMemo(
    () => [
      {
        header: "E-Book Name",
        accessor: "name",
        render: (row) => (
          <div className="flex items-center gap-3">
            {row.thumbnailUrl ? (
              <img
                src={row.thumbnailUrl}
                className="w-12 h-16 rounded-md object-cover border border-slate-200 shadow-sm"
                alt={row.name}
              />
            ) : (
              <div className="w-12 h-16 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 border border-slate-200">
                <BookOpen className="w-6 h-6" />
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900">{row.name}</p>
              {row.startDate && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar size={12} />{" "}
                  {new Date(row.startDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        header: "Classification",
        render: (row) => (
          <div className="space-y-1">
            {row.categories?.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Layers size={12} className="text-blue-500" />
                {row.categories.map((c) => c.name || c).join(", ")}
              </div>
            )}
            {row.subCategories?.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-500 ml-2">
                <ChevronRight size={10} />
                {row.subCategories.map((s) => s.name || s).join(", ")}
              </div>
            )}
          </div>
        ),
      },
      {
        header: "Language",
        render: (row) => (
          <div className="flex gap-1">
            {row.languages?.length > 0 ? (
              row.languages.map((l, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-600 flex items-center gap-1"
                >
                  <Globe size={10} /> {l.name || l.code || l}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">None</span>
            )}
          </div>
        ),
      },
      {
        header: "Status",
        accessor: "isActive",
        render: (row) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {row.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
            {row.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        header: "Actions",
        className: "text-right",
        render: (row) => (
          <div className="flex justify-end gap-2">
            {row.bookFileUrl && (
              <button
                onClick={() =>
                  handleDownload(row.bookFileUrl, `${row.name}.pdf`)
                }
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download size={16} />
              </button>
            )}
            <button
              onClick={() => openModal("ebook", null, row)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete("ebook", row._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="p-6 space-y-6">
      {/* 🎓 HERO HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              E-Book Library
              <span className="px-3 py-1 bg-white/20 text-sm rounded-full border border-white/30 font-medium">
                {ebooks.length} E-Books
              </span>
            </h1>
            <p className="text-blue-100 text-base flex items-center gap-2 mt-1">
              <FileText size={16} /> Manage digital library content
            </p>
          </div>
        </div>
      </motion.div>

      {/* 📊 STATISTICS (Simplified for E-Books) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total E-Books"
          value={ebooks.length}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Active E-Books"
          value={ebooks.filter((e) => e.isActive).length}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Inactive E-Books"
          value={ebooks.filter((e) => !e.isActive).length}
          icon={EyeOff}
          color="red"
        />
      </div>

      {/* 🎯 TAB HEADER & SEARCH */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="flex p-1 bg-slate-100 rounded-xl">
          {["ebooks", "classification"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "classification" ? "Classifications" : "E-Books List"}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full xl:w-auto justify-end px-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search e-books..."
          />
          <button
            onClick={() =>
              openModal(activeTab === "ebooks" ? "ebook" : "category")
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" /> Add New
          </button>
        </div>
      </div>

      {/* 📑 CONTENT AREA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        {activeTab === "ebooks" && (
          <DataTable
            title=""
            columns={ebookColumns}
            data={filteredEBooks}
            loading={ebookLoading}
            hideSearch={true}
          />
        )}

        {activeTab === "classification" && (
          <div className="p-4 space-y-3">
            {catLoading || subLoading ? (
              <div className="flex justify-center items-center h-64 text-blue-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderTree className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  No Categories Found
                </h3>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className="border border-slate-200 rounded-xl overflow-hidden hover:border-blue-200 transition-colors"
                >
                  <div
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white cursor-pointer group"
                    onClick={() => toggleExpand(category._id)}
                  >
                    <div className="flex items-center gap-4">
                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${expandedCategories[category._id] ? "rotate-90 text-blue-500" : ""}`}
                      />
                      {category.thumbnailUrl ? (
                        <img
                          src={category.thumbnailUrl}
                          className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200"
                          alt=""
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                          <Layers className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {(search
                            ? filteredSubCategories[category._id]?.length
                            : groupedSubCategories[category._id]?.length) ||
                            0}{" "}
                          Subcategories
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal("subcategory", category._id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        + Sub
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal("category", null, category);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete("category", category._id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {expandedCategories[category._id] && (
                    <div className="border-t border-slate-100 bg-white">
                      {(search
                        ? filteredSubCategories[category._id]
                        : groupedSubCategories[category._id]
                      )?.length > 0 ? (
                        <div className="grid grid-cols-1 divide-y divide-slate-50">
                          {(search
                            ? filteredSubCategories[category._id]
                            : groupedSubCategories[category._id]
                          ).map((sub) => (
                            <div
                              key={sub._id}
                              className="flex items-center justify-between p-3 pl-16 hover:bg-slate-50 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                  {sub.thumbnailUrl ? (
                                    <img
                                      src={sub.thumbnailUrl}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <FolderTree className="w-4 h-4" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-slate-700">
                                  {sub.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                <button
                                  onClick={() =>
                                    openModal("subcategory", null, sub)
                                  }
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete("subcategory", sub._id)
                                  }
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-xs italic">
                          No subcategories found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {modalType === "ebook" ? (
        <EBookModal
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

// 🎨 STAT CARD COMPONENT
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-2xl font-black text-slate-800 mt-2">{value}</p>
        </div>
        <div
          className={`p-3 rounded-xl shadow-sm ${colorMap[color]} text-white`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

export default EBookManager;
