import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="hover:underline">Home</Link>
        </li>
        <li>
          <Link to="/login" className="hover:underline">Login</Link>
        </li>
        <li>
          <Link to="/consultant" className="hover:underline">Consultant</Link>
        </li>
      </ul>
    </nav>
  );
}
