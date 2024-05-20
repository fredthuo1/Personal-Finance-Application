import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-link">
                <h2 className="navbar-brand">Personal Finance Advisor</h2>
            </Link>
            <div className="navbar-links">
                <Link to="/about-us" className="navbar-link">About Us</Link>
                {!isAuthenticated && (
                    <>
                        <Link to="/sign-up" className="navbar-link">Signup</Link>
                        <Link to="/login" className="navbar-link">Login</Link>
                    </>
                )}
                {isAuthenticated && (
                    <>
                        <Link to="/upload-data" className="navbar-link">Upload</Link>
                        <Link to="/transactions" className="navbar-link">Transactions</Link>
                        <Link to="/monthly-transactions" className="navbar-link">Monthly</Link>
                        <Link to="/weekly-transactions" className="navbar-link">Weekly</Link>
                        <Link to="/analysis" className="navbar-link">Analysis</Link>
                        <button onClick={logout} className="navbar-link">Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
