import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Loader2,
  Layers,
  Sparkles,
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  fetchTestSeries,
  deleteTestSeries,
} from "../../../store/slices/testSeriesSlice";
import DataTable from "../../../components/DataTable";

const TestSeriesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: seriesList, loading } = useSelector(
    (state) => state.testSeries,
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchTestSeries({}));
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (
      !confirm("Are you sure? This will delete all tests within this series.")
    )
      return;
    try {
      await dispatch(deleteTestSeries(id)).unwrap();
      toast.success("Series deleted");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const filteredData = seriesList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      header: "Series Name",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            {row.thumbnail ? (
              <img
                src={row.thumbnail}
                className="w-full h-full object-cover rounded-xl"
                alt=""
              />
            ) : (
              <BookOpen className="w-6 h-6" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-800">{row.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {row.noOfTests} Tests • {row.accessType}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "originalPrice",
      render: (row) => (
        <div className="font-bold text-slate-700">
          {row.originalPrice > 0 ? (
            `₹${row.originalPrice}`
          ) : (
            <span className="text-green-600">Free</span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${row.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
        >
          {row.isActive ? "Active" : "Draft"}
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
            onClick={() => navigate(`/test-series/${row._id}`)}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-3 h-3" /> Manage
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center md:justify-start gap-3 mb-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Trophy className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-4xl font-bold text-white">
                  📚 Test Series Manager
                </h1>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-indigo-100 text-lg"
              >
                🎯 Manage your exam bundles and packages
              </motion.p>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 w-full md:w-auto"
            >
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-4 top-4 w-5 h-5 text-indigo-300" />
                <input
                  type="text"
                  placeholder="Search series..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/20 backdrop-blur-md border-2 border-white/30 text-white placeholder-indigo-200 focus:bg-white/30 focus:border-white/50 outline-none transition-all font-medium"
                />
              </div>
              <motion.button
                onClick={() => navigate("/test-series/create")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3.5 bg-white text-indigo-600 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" /> ✨ Create Series
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 overflow-hidden"
        >
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-indigo-600">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-lg font-bold text-slate-600">Loading test series...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={filteredData} hideSearch />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TestSeriesList;
