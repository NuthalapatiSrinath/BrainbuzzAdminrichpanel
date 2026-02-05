import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Newspaper,
  ShoppingCart,
  Users,
  LogOut,
  X,
  HelpCircle,
  Image as ImageIcon,
  Tag,
  Video,
  FileQuestion,
  Languages,
  Clock,
  Book,
  ChevronRight,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();

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
      bg-card border-r border-border
      transition-all duration-300
      flex flex-col
      w-[72px] hover:w-[280px]
    `
    : `
      fixed top-0 left-0 h-full z-50
      bg-card border-r border-border
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
        <div className="h-header-h flex items-center px-5 border-b border-border/50 shrink-0 gap-3 bg-card relative">
          {/* icon logo always visible */}
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl shrink-0 border border-indigo-100 dark:border-indigo-800">
            <img
              src="/vite.svg"
              alt="Logo"
              className="w-6 h-6 animate-[spin_10s_linear_infinite]"
            />
          </div>

          {/* text logo → visible on mobile OR on desktop hover */}
          <div
            className={`flex flex-col ${
              isMobile ? "block" : "hidden group-hover:block"
            }`}
          >
            <span className="font-bold text-lg text-text-main leading-none">
              BrainBuzz
            </span>
            <span className="text-[10px] text-text-sub uppercase tracking-widest font-semibold mt-0.5">
              Admin Panel
            </span>
          </div>

          {/* mobile close button */}
          {isMobile && (
            <button
              onClick={onClose}
              className="absolute right-4 p-2 rounded-full text-text-sub hover:text-danger bg-page hover:bg-red-50 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-2 py-6 overflow-y-auto no-scrollbar">
          <ul className="space-y-1">
            {/* section label — only visible when expanded or mobile */}
            <li
              className={`
              px-4 text-[11px] font-extrabold text-text-muted uppercase tracking-widest
              mb-2 mt-1
              ${isMobile ? "block" : "hidden group-hover:block"}
            `}
            >
              Overview
            </li>

            <NavItem
              to="/"
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            {/* LEARNING MANAGEMENT */}
            <li
              className={`
              px-4 text-[11px] font-extrabold text-text-muted uppercase tracking-widest
              mb-2 mt-6
              ${isMobile ? "block" : "hidden group-hover:block"}
            `}
            >
              Learning Management
            </li>

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

            {/* SALES & USERS */}
            <li
              className={`
              px-4 text-[11px] font-extrabold text-text-muted uppercase tracking-widest
              mb-2 mt-6
              ${isMobile ? "block" : "hidden group-hover:block"}
            `}
            >
              Sales & Users
            </li>

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

            {/* SYSTEM */}
            <li
              className={`
              px-4 text-[11px] font-extrabold text-text-muted uppercase tracking-widest
              mb-2 mt-6
              ${isMobile ? "block" : "hidden group-hover:block"}
            `}
            >
              System
            </li>

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
          </ul>
        </nav>

        {/* FOOTER */}
        <div
          className={`p-6 border-t border-border/50 shrink-0 bg-card ${
            isMobile ? "block" : "hidden group-hover:block"
          }`}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-danger bg-danger/10 hover:bg-danger/20 py-3 rounded-lg font-bold transition-colors text-sm"
          >
            <LogOut size={18} />
            Logout Account
          </button>
        </div>
      </aside>
    </>
  );
};

/* ---------- COMPONENTS ---------- */

const NavItem = ({ to, icon: Icon, label, onClick, isMobile }) => (
  <li>
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-3.5 rounded-lg mb-1 transition-all duration-200 group/item relative overflow-hidden
        ${
          isActive
            ? "bg-primary text-white font-semibold shadow-sm"
            : "text-text-sub hover:bg-page hover:text-text-main"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
          )}

          <Icon
            className={`w-5 h-5 mr-3 shrink-0 ${
              isActive
                ? "text-white"
                : "text-text-sub group-hover/item:text-primary"
            }`}
          />

          {/* Label: Always visible on Mobile OR on Desktop Hover */}
          <span
            className={`truncate ${
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
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg mb-1 transition-all duration-200 group/item
      ${
        isActive
          ? "bg-page text-text-main font-medium shadow-sm"
          : "text-text-sub hover:bg-page hover:text-text-main"
      }`}
  >
    <div className="flex items-center">
      <Icon
        className={`w-5 h-5 mr-3 ${
          isActive
            ? "text-primary"
            : "text-text-sub group-hover/item:text-primary"
        }`}
      />

      <span
        className={`truncate ${
          isMobile ? "inline" : "hidden group-hover:inline"
        }`}
      >
        {label}
      </span>
    </div>

    {/* Chevron: Always visible on Mobile OR on Desktop Hover */}
    <ChevronRight
      className={`w-4 h-4 text-text-sub transition-transform duration-300 ${
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
        className={`ml-5 pl-3 border-l-2 border-primary/20 overflow-hidden ${
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
      onClick={onClick}
      className={({ isActive }) =>
        `block px-4 py-2.5 text-[13px] rounded-r-lg transition-all duration-200
        ${
          isActive
            ? "text-primary font-bold bg-primary-light/50 border-l-2 border-primary -ml-[2px]"
            : "text-text-sub hover:text-text-main hover:bg-page"
        }`
      }
    >
      {label}
    </NavLink>
  </li>
);

export default Sidebar;
