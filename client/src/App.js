import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import UploadData from './pages/UploadData';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/sign-up" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/upload-data" element={<UploadData />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
