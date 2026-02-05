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
} from "lucide-react";
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
    if (!url) return;
    try {
      const toastId = toast.loading("Preparing download...");
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || url.split("/").pop() || "download.pdf";
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

  // --- MODAL CONFIG FOR CATEGORIES ---
  const getModalConfig = () => {
    if (modalType === "category" || modalType === "subcategory") {
      return [
        {
          name: "name",
          label:
            modalType === "category" ? "Category Name" : "SubCategory Name",
          type: "text",
          required: true,
          placeholder: "e.g. Technology",
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
  const ebookColumns = [
    {
      header: "E-Book",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.thumbnailUrl ? (
            <img
              src={row.thumbnailUrl}
              className="w-14 h-14 rounded-lg object-contain bg-slate-50 border border-slate-200"
              alt={row.name}
            />
          ) : (
            <div className="w-14 h-14 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 border border-indigo-100">
              <BookOpen className="w-6 h-6" />
            </div>
          )}
          <div>
            <p className="font-bold text-slate-800">{row.name}</p>
            {row.startDate && (
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(row.startDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Categories",
      accessor: "categories",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.categories?.slice(0, 2).map((cat, idx) => (
            <span
              key={idx}
              className="text-xs bg-slate-100 px-2 py-1 rounded-md font-medium text-slate-700"
            >
              {cat.name || cat}
            </span>
          ))}
          {row.categories?.length > 2 && (
            <span className="text-xs text-slate-400 px-2 py-1">
              +{row.categories.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Access",
      accessor: "accessType",
      render: (row) => (
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 ${row.accessType === "FREE" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
        >
          {row.accessType === "FREE" ? "🆓" : "💰"} {row.accessType}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 ${row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
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
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "_id",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          {row.bookFileUrl && (
            <button
              onClick={() => handleDownload(row.bookFileUrl, `${row.name}.pdf`)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Download Book"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => openModal("ebook", null, row)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete("ebook", row._id)}
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
          {["ebooks", "classification"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "classification" ? "Classifications" : "E-Books"}
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full xl:w-auto justify-end px-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search..."
          />
          {/* Dynamic Add Button */}
          <button
            onClick={() =>
              openModal(activeTab === "ebooks" ? "ebook" : "category")
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-5 h-5" /> Add New
          </button>
        </div>
      </div>

      {/* Stats Cards (Only on E-Books tab) */}
      {activeTab === "ebooks" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">
                  Total E-Books
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-gray-100 mt-1">
                  {ebooks.length}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">
                  Active
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {ebooks.filter((e) => e.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">
                  Free
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {ebooks.filter((e) => e.accessType === "FREE").length}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
                <span className="text-2xl">🆓</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">
                  Paid
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {ebooks.filter((e) => e.accessType === "PAID").length}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT AREA --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
        {/* TAB 1: E-BOOKS */}
        {activeTab === "ebooks" &&
          (ebookLoading ? (
            <div className="flex justify-center items-center h-96 text-indigo-600">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          ) : filteredEBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
              <BookOpen className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-bold text-slate-600">
                No e-books found
              </p>
            </div>
          ) : (
            <DataTable
              columns={ebookColumns}
              data={filteredEBooks}
              hideSearch
            />
          ))}

        {/* TAB 2: CLASSIFICATION */}
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
                    className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden group"
                  >
                    {/* Category Header */}
                    <div className="p-5 flex items-start justify-between bg-slate-50/50 dark:bg-gray-700/50">
                      <div
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => toggleExpand(category._id)}
                      >
                        <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-xl border border-slate-100 dark:border-gray-600 flex items-center justify-center shadow-sm overflow-hidden">
                          {category.thumbnailUrl ? (
                            <img
                              src={category.thumbnailUrl}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <Layers className="w-6 h-6 text-indigo-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">
                            {category.name}
                          </h3>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-0.5">
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
                          className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-slate-400 hover:text-indigo-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete("category", category._id)}
                          className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subcategories Accordion */}
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
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-600 group/sub transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {sub.thumbnailUrl ? (
                                  <img
                                    src={sub.thumbnailUrl}
                                    className="w-6 h-6 rounded-md object-cover"
                                    alt=""
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                                    <FolderTree className="w-3 h-3 text-slate-500" />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-slate-600 group-hover/sub:text-slate-900">
                                  {sub.name}
                                </span>
                              </div>
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

export default EBookManager;
