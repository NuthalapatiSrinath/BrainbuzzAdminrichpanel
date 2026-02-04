import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Loader2,
  Layers,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/common/SearchBar";
import GenericModal from "../../components/modals/GenericModal";
import PublicationModal from "../../components/modals/PublicationModal";

// Actions
import {
  fetchPublications,
  createPublication,
  updatePublication,
  deletePublication,
} from "../../store/slices/publicationSlice";
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

// ✅ CRITICAL: Content Type for this Module
const PUBLICATION_CONTENT_TYPE = "PUBLICATION";

const PublicationManager = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("publications");

  // --- REDUX DATA ---
  const { items: publications, loading: pubLoading } = useSelector(
    (state) => state.publications,
  );
  const { categories, loading: catLoading } = useSelector(
    (state) => state.category,
  );
  const { subCategories, loading: subLoading } = useSelector(
    (state) => state.subCategory,
  );

  // --- LOCAL STATE ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'publication', 'category', 'subcategory'
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [targetParentId, setTargetParentId] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    dispatch(fetchPublications({}));
    dispatch(fetchCategories({ contentType: PUBLICATION_CONTENT_TYPE }));
    dispatch(fetchSubCategories({ contentType: PUBLICATION_CONTENT_TYPE }));
  }, [dispatch]);

  // --- HELPERS ---
  const toggleExpand = (catId) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const groupedSubCategories = useMemo(() => {
    const grouped = {};
    subCategories.forEach((sub) => {
      const catId = sub.category?._id || sub.category;
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(sub);
    });
    return grouped;
  }, [subCategories]);

  // --- FILTERING (Instant Search) ---
  const filteredPublications = useMemo(() => {
    if (!search) return publications;
    const s = search.toLowerCase();
    return publications.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.categories?.some((c) => c.name?.toLowerCase().includes(s)),
    );
  }, [publications, search]);

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
      if (matchingSubs.length > 0) {
        filtered[catId] = matchingSubs;
      }
    });
    return filtered;
  }, [groupedSubCategories, search]);

  // --- HANDLERS ---
  const openCreateModal = (type, parentId = null) => {
    setModalType(type);
    setSelectedItem(null);
    if (parentId) setTargetParentId(parentId);
    setModalOpen(true);
  };

  const openEditModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCreate = async (data) => {
    try {
      if (modalType === "publication") {
        await dispatch(createPublication(data)).unwrap();
      } else if (modalType === "category") {
        await dispatch(
          createCategory({ ...data, contentType: PUBLICATION_CONTENT_TYPE }),
        ).unwrap();
      } else if (modalType === "subcategory") {
        const payload = targetParentId
          ? { ...data, category: targetParentId }
          : data;
        await dispatch(createSubCategory(payload)).unwrap();
      }
      toast.success("Created successfully");
      setModalOpen(false);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Operation failed");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const id = selectedItem._id;
      if (modalType === "publication") {
        if (data._isEdit) delete data._isEdit; // Clean internal flag
        await dispatch(updatePublication({ id, data })).unwrap();
      } else if (modalType === "category") {
        await dispatch(updateCategory({ id, formData: data })).unwrap();
      } else if (modalType === "subcategory") {
        await dispatch(updateSubCategory({ id, formData: data })).unwrap();
      }
      toast.success("Updated successfully");
      setModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      if (type === "publication")
        await dispatch(deletePublication(id)).unwrap();
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
    if (modalType === "category") {
      return [
        {
          name: "name",
          label: "Category Name",
          type: "text",
          required: true,
          placeholder: "e.g. Engineering",
        },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "thumbnail",
          label: "Thumbnail",
          type: "file",
          accept: "image/*",
          previewKey: "thumbnailUrl",
        },
      ];
    }
    if (modalType === "subcategory") {
      const fields = [
        {
          name: "name",
          label: "SubCategory Name",
          type: "text",
          required: true,
          placeholder: "e.g. Computer Science",
        },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "thumbnail",
          label: "Thumbnail",
          type: "file",
          accept: "image/*",
          previewKey: "thumbnailUrl",
        },
      ];
      if (!targetParentId && !selectedItem) {
        const options = categories.map((c) => ({
          label: c.name,
          value: c._id,
        }));
        fields.unshift({
          name: "category",
          label: "Parent Category",
          type: "select",
          options,
          required: true,
        });
      }
      return fields;
    }
    return [];
  };

  // --- COLUMNS ---
  const publicationColumns = [
    {
      header: "Publication",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.thumbnailUrl ? (
            <img
              src={row.thumbnailUrl}
              alt=""
              className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="font-bold text-slate-800">{row.name}</p>
            <p className="text-xs text-slate-500">
              ₹{row.discountPrice || row.originalPrice} • {row.availableIn}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "categories",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.categories?.map((c, i) => (
            <span
              key={i}
              className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded"
            >
              {c.name || c}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <span
          className={`text-xs font-bold px-2 py-1 rounded ${
            row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
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
            onClick={() => openEditModal("publication", row)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete("publication", row._id)}
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
      {/* HEADER & TABS */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto w-full xl:w-auto">
          {["publications", "classification"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "classification" ? "Classifications" : tab}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full xl:w-auto justify-end px-4">
          <SearchBar onSearch={setSearch} placeholder="Search..." />
          <button
            onClick={() =>
              openCreateModal(
                activeTab === "publications" ? "publication" : "category",
              )
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-5 h-5" /> Add New
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* TAB 1: PUBLICATIONS */}
        {activeTab === "publications" &&
          (pubLoading ? (
            <div className="flex justify-center items-center h-64 text-indigo-500">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={publicationColumns}
              data={filteredPublications}
              hideSearch={true}
              // ✅ Removed pagination prop for client-side functionality
            />
          ))}

        {/* TAB 2: CLASSIFICATION */}
        {activeTab === "classification" && (
          <div className="p-4 space-y-4">
            {catLoading || subLoading ? (
              <div className="flex justify-center items-center h-64 text-indigo-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(category._id)}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedCategories[category._id] ? "rotate-90" : ""
                        }`}
                      />
                      {category.thumbnailUrl ? (
                        <img
                          src={category.thumbnailUrl}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          alt=""
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                          <Layers className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateModal("subcategory", category._id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Sub
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal("category", category);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete("category", category._id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {expandedCategories[category._id] && (
                    <div className="border-t border-slate-200 bg-white">
                      {(search
                        ? filteredSubCategories[category._id]
                        : groupedSubCategories[category._id]
                      )?.length > 0 ? (
                        <div className="grid grid-cols-1 divide-y divide-slate-100">
                          {(search
                            ? filteredSubCategories[category._id]
                            : groupedSubCategories[category._id]
                          ).map((sub) => (
                            <div
                              key={sub._id}
                              className="flex items-center justify-between p-3 pl-14 hover:bg-slate-50"
                            >
                              <div className="flex items-center gap-3">
                                {sub.thumbnailUrl ? (
                                  <img
                                    src={sub.thumbnailUrl}
                                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                                    alt=""
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <FolderTree className="w-4 h-4" />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-slate-700">
                                  {sub.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    openEditModal("subcategory", sub)
                                  }
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete("subcategory", sub._id)
                                  }
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-sm italic">
                          No subcategories found. Add one above.
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

      {/* MODALS */}
      {modalType === "publication" ? (
        <PublicationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={selectedItem ? handleUpdate : handleCreate}
          initialData={selectedItem}
        />
      ) : (
        <GenericModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={selectedItem ? handleUpdate : handleCreate}
          initialData={selectedItem}
          title={`${selectedItem ? "Edit" : "Add"} ${modalType}`}
          fields={getModalConfig()}
        />
      )}
    </div>
  );
};

export default PublicationManager;
