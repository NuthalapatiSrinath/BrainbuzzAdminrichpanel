import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  Loader2,
  Layers,
  ChevronRight,
  FolderTree,
  Book,
  PenTool,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import DataTable from "../../../components/DataTable";
import SearchBar from "../../../components/common/SearchBar";
import GenericModal from "../../../components/modals/GenericModal";
import PYQModal from "../../../components/modals/PYQModal";

// Services & Actions
import {
  fetchPYQs,
  createPYQ,
  updatePYQ,
  deletePYQ,
} from "../../../store/slices/pyqSlice";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../store/slices/categorySlice";
import {
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../../../store/slices/subCategorySlice";
import {
  fetchExams,
  createExam,
  updateExam,
  deleteExam,
} from "../../../store/slices/examSlice";
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../../store/slices/subjectSlice";

// ✅ Match Backend Enum
const PYQ_CONTENT_TYPE = "PYQ_EBOOK";

const PYQManager = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("papers");

  // Redux Data
  const { pyqs, loading: pyqLoading } = useSelector((state) => state.pyq);
  const { categories, loading: catLoading } = useSelector(
    (state) => state.category,
  );
  const { subCategories, loading: subLoading } = useSelector(
    (state) => state.subCategory,
  );
  const { items: exams, loading: examLoading } = useSelector(
    (state) => state.exams || { items: [], loading: false },
  );
  const { items: subjects, loading: subjectLoading } = useSelector(
    (state) => state.subjects || { items: [], loading: false },
  );

  // UI State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [targetParentId, setTargetParentId] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories({ contentType: PYQ_CONTENT_TYPE }));
    dispatch(fetchSubCategories({ contentType: PYQ_CONTENT_TYPE }));
    dispatch(fetchExams());
    dispatch(fetchSubjects());
    dispatch(fetchPYQs({}));
  }, [dispatch]);

  const toggleExpand = (catId) =>
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));

  const groupedSubCategories = useMemo(() => {
    const grouped = {};
    subCategories.forEach((sub) => {
      const catId = sub.category?._id || sub.category;
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(sub);
    });
    return grouped;
  }, [subCategories]);

  // --- GLOBAL SEARCH LOGIC (Instant Search) ---
  const filteredPapers = useMemo(() => {
    if (!search) return pyqs;
    const s = search.toLowerCase();
    return pyqs.filter(
      (p) =>
        p.paperCategory?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.categoryId?.name?.toLowerCase().includes(s) ||
        p.subCategoryId?.name?.toLowerCase().includes(s) ||
        p.examId?.name?.toLowerCase().includes(s) ||
        p.subjectId?.name?.toLowerCase().includes(s),
    );
  }, [pyqs, search]);

  const filteredExams = useMemo(() => {
    if (!search) return exams;
    return exams.filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [exams, search]);

  const filteredSubjects = useMemo(() => {
    if (!search) return subjects;
    return subjects.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [subjects, search]);

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

  // --- MODAL HANDLERS ---
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
      if (modalType === "paper") await dispatch(createPYQ(data)).unwrap();
      else if (modalType === "category")
        await dispatch(
          createCategory({ ...data, contentType: PYQ_CONTENT_TYPE }),
        ).unwrap();
      else if (modalType === "subcategory") {
        const payload = targetParentId
          ? { ...data, category: targetParentId }
          : data;
        await dispatch(createSubCategory(payload)).unwrap();
      } else if (modalType === "exam")
        await dispatch(createExam(data)).unwrap();
      else if (modalType === "subject")
        await dispatch(createSubject(data)).unwrap();

      toast.success("Created successfully");
      setModalOpen(false);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Operation failed");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const id = selectedItem._id;
      if (modalType === "paper")
        await dispatch(updatePYQ({ id, data })).unwrap();
      else if (modalType === "category")
        await dispatch(updateCategory({ id, formData: data })).unwrap();
      else if (modalType === "subcategory")
        await dispatch(updateSubCategory({ id, formData: data })).unwrap();
      else if (modalType === "exam")
        await dispatch(updateExam({ id, data })).unwrap();
      else if (modalType === "subject")
        await dispatch(updateSubject({ id, data })).unwrap();

      toast.success("Updated successfully");
      setModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      if (type === "paper") await dispatch(deletePYQ(id)).unwrap();
      else if (type === "category") await dispatch(deleteCategory(id)).unwrap();
      else if (type === "subcategory")
        await dispatch(deleteSubCategory(id)).unwrap();
      else if (type === "exam") await dispatch(deleteExam(id)).unwrap();
      else if (type === "subject") await dispatch(deleteSubject(id)).unwrap();
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getModalConfig = () => {
    if (modalType === "category")
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
    if (modalType === "subcategory") {
      const fields = [
        {
          name: "name",
          label: "SubCategory Name",
          type: "text",
          required: true,
          placeholder: "e.g. CSE",
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
    if (modalType === "exam")
      return [
        {
          name: "name",
          label: "Exam Name",
          type: "text",
          required: true,
          placeholder: "e.g. UPSC",
        },
      ];
    if (modalType === "subject")
      return [
        {
          name: "name",
          label: "Subject Name",
          type: "text",
          required: true,
          placeholder: "e.g. History",
        },
      ];
    return [];
  };

  const paperColumns = [
    {
      header: "Paper",
      accessor: "paperCategory",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.thumbnailUrl ? (
            <img
              src={row.thumbnailUrl}
              alt={row.paperCategory}
              className="w-8 h-8 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          )}
          <div>
            <p className="font-bold text-slate-700">{row.paperCategory}</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
              {row.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "categoryId",
      render: (r) => (
        <span className="text-sm font-medium text-slate-700">
          {r.categoryId?.name || "-"}
        </span>
      ),
    },
    {
      header: "SubCategory",
      accessor: "subCategoryId",
      render: (r) => (
        <span className="text-sm text-slate-500">
          {r.subCategoryId?.name || "-"}
        </span>
      ),
    },
    {
      header: "Exam Date",
      accessor: "examDate",
      render: (r) => (
        <span className="text-xs text-slate-500">
          {new Date(r.examDate).toLocaleDateString()}
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
            onClick={() => openEditModal("paper", row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete("paper", row._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const simpleColumns = [
    {
      header: "Name",
      accessor: "name",
      render: (r) => <span className="font-bold text-slate-700">{r.name}</span>,
    },
    {
      header: "Actions",
      accessor: "_id",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() =>
              openEditModal(activeTab === "exams" ? "exam" : "subject", r)
            }
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              handleDelete(activeTab === "exams" ? "exam" : "subject", r._id)
            }
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
          {["papers", "classification", "exams", "subjects"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "papers"
                ? "Question Papers"
                : tab === "classification"
                  ? "Classifications"
                  : tab}
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
              openCreateModal(
                activeTab === "papers"
                  ? "paper"
                  : activeTab === "classification"
                    ? "category"
                    : activeTab === "exams"
                      ? "exam"
                      : "subject",
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
        {activeTab === "papers" &&
          (pyqLoading ? (
            <div className="flex justify-center items-center h-64 text-indigo-500">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={paperColumns}
              data={filteredPapers}
              hideSearch={true}
            />
          ))}

        {activeTab === "exams" &&
          (examLoading ? (
            <div className="flex justify-center items-center h-64 text-indigo-500">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={simpleColumns}
              data={filteredExams}
              hideSearch={true}
            />
          ))}

        {activeTab === "subjects" &&
          (subjectLoading ? (
            <div className="flex justify-center items-center h-64 text-indigo-500">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={simpleColumns}
              data={filteredSubjects}
              hideSearch={true}
            />
          ))}

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
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
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
                                    alt=""
                                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
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

      {modalType === "paper" && (
        <PYQModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={selectedItem ? handleUpdate : handleCreate}
          initialData={selectedItem}
        />
      )}
      {modalType !== "paper" && (
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

export default PYQManager;
