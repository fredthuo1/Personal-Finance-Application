import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <h2 className="navbar-brand">Personal Finance Advisor</h2>
            <div className="navbar-links">
                <Link to="/sign-up" className="navbar-link">Signup</Link>
                <Link to="/login" className="navbar-link">Login</Link>
                <Link to="/upload-data" className="navbar-link">Upload Data</Link>
            </div>
        </nav>
    );
}

export default Navbar;