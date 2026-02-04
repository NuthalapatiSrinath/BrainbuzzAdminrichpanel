import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
      <h1 className="text-6xl font-bold text-indigo-600">404</h1>
      <p className="text-xl text-slate-600 mt-2">Page not found</p>
      <Link to="/" className="mt-4 text-blue-500 hover:underline">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
