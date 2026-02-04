import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  LayoutDashboard,
  BookOpen, // Courses & E-Books
  FileText, // Test Series
  Newspaper, // Current Affairs
  ShoppingCart, // Orders
  Users, // Users
  Settings,
  LogOut,
  X,
  HelpCircle,
  Image as ImageIcon, // Banners
  Tag, // Coupons
  Video, // Live Class
  FileQuestion, // PYQ
  Languages,
  Clock,
  Book, // Publications
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  // Removed openMenus state and toggle logic since all items are now flat

  const handleLinkClick = () => {
    if (isMobile && onClose) onClose();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const sidebarClasses = !isMobile
    ? `
      group
      fixed top-0 left-0 h-full z-50
      bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
      transition-all duration-300
      flex flex-col
      w-[72px] hover:w-[280px] shadow-xl
    `
    : `
      fixed top-0 left-0 h-full z-50
      bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
      transition-transform duration-300
      w-[280px] max-w-[85vw] flex flex-col
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside className={sidebarClasses}>
        {/* HEADER */}
        <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-slate-800 shrink-0 gap-3 bg-white dark:bg-slate-900 relative">
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl shrink-0 border border-indigo-100 dark:border-indigo-800">
            <img
              src="/vite.svg"
              alt="Logo"
              className="w-6 h-6 animate-[spin_10s_linear_infinite]"
            />
          </div>

          <div
            className={`flex flex-col ${
              isMobile ? "block" : "hidden group-hover:block"
            }`}
          >
            <span className="font-bold text-lg text-slate-800 dark:text-white leading-none">
              BrainBuzz
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
              Admin Panel
            </span>
          </div>

          {isMobile && (
            <button
              onClick={onClose}
              className="absolute right-4 p-2 rounded-full text-slate-500 hover:text-red-500 bg-slate-50 hover:bg-red-50 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto no-scrollbar">
          <ul className="space-y-1">
            <SectionLabel label="Overview" isMobile={isMobile} />

            <NavItem
              to="/"
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            <SectionLabel label="Learning Management" isMobile={isMobile} />

            {/* Individual Content Items - No Groups */}
            <NavItem
              to="/courses"
              icon={BookOpen}
              label="All Courses"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            <NavItem
              to="/test-series"
              icon={FileText}
              label="Test Series"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            <NavItem
              to="/live-classes"
              icon={Video}
              label="Live Classes"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            <NavItem
              to="/current-affairs"
              icon={Newspaper}
              label="Current Affairs"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            <NavItem
              to="/pyq"
              icon={FileQuestion}
              label="PYQ Papers"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            <NavItem
              to="/publications"
              icon={Book}
              label="Publications"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            <NavItem
              to="/ebooks"
              icon={BookOpen}
              label="E-Books"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            <NavItem
              to="/daily-quizzes"
              icon={HelpCircle}
              label="Daily Quizzes"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            <SectionLabel label="Sales & Users" isMobile={isMobile} />

            <NavItem
              to="/orders"
              icon={ShoppingCart}
              label="Orders"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            <NavItem
              to="/coupons"
              icon={Tag}
              label="Coupons"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            <NavItem
              to="/banners"
              icon={ImageIcon}
              label="Banners"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            {/* System */}
            <li
              className={`px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-6 ${
                isMobile ? "block" : "hidden group-hover:block"
              }`}
            >
              System
            </li>

            {/* ✅ Added Languages Here */}
            <NavItem
              to="/languages"
              icon={Languages}
              label="Languages"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />
            <NavItem
              to="/validity"
              icon={Clock}
              label="Validities"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />
            <NavItem
              to="/settings"
              icon={Settings}
              label="Settings"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />
            {/* <NavItem
              to="/support"
              icon={HelpCircle}
              label="Support"
              onClick={handleLinkClick}
              isMobile={isMobile}
            /> */}
          </ul>
        </nav>

        {/* FOOTER */}
        <div
          className={`p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900 ${
            isMobile ? "block" : "hidden group-hover:block"
          }`}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-100 py-2.5 rounded-xl font-bold transition-all text-xs uppercase tracking-wide shadow-sm"
          >
            <LogOut size={16} />
            Logout Account
          </button>
        </div>
      </aside>
    </>
  );
};

/* ---------- SUB COMPONENTS (Updated Colors) ---------- */

const SectionLabel = ({ label, isMobile }) => (
  <li
    className={`px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-6 ${
      isMobile ? "block" : "hidden group-hover:block"
    }`}
  >
    {label}
  </li>
);

const NavItem = ({ to, icon: Icon, label, onClick, isMobile }) => (
  <li>
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-3 py-3 rounded-xl mb-1 transition-all duration-200 group/item relative overflow-hidden
        ${
          isActive
            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-bold shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-800"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />
          )}

          <Icon
            className={`w-5 h-5 mr-3 shrink-0 transition-colors ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 group-hover/item:text-slate-600 dark:group-hover/item:text-slate-300"
            }`}
          />
          <span
            className={`truncate font-medium text-sm ${
              isMobile ? "inline" : "hidden group-hover:inline"
            }`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  </li>
);

const MenuButton = ({
  label,
  icon: Icon,
  isOpen,
  isActive,
  onClick,
  isMobile,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl mb-1 transition-all duration-200 group/item
      ${
        isActive
          ? "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
      }`}
  >
    <div className="flex items-center">
      <Icon
        className={`w-5 h-5 mr-3 transition-colors ${
          isActive
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-slate-400 group-hover/item:text-slate-600 dark:group-hover/item:text-slate-300"
        }`}
      />
      <span
        className={`truncate font-medium text-sm ${
          isMobile ? "inline" : "hidden group-hover:inline"
        }`}
      >
        {label}
      </span>
    </div>

    <ChevronRight
      className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
        isOpen ? "rotate-90" : ""
      } ${isMobile ? "inline" : "hidden group-hover:inline"}`}
    />
  </button>
);

const SubMenu = ({ isOpen, children, isMobile }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.ul
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 overflow-hidden space-y-1 my-1 ${
          isMobile ? "block" : "hidden group-hover:block"
        }`}
      >
        {children}
      </motion.ul>
    )}
  </AnimatePresence>
);

const SubNavItem = ({ to, label, onClick }) => (
  <li>
    <NavLink
      to={to}
      end={true}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-3 py-2 text-[13px] rounded-lg transition-all duration-200 font-medium
        ${
          isActive
            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        }`
      }
    >
      {label}
    </NavLink>
  </li>
);

export default Sidebar;
