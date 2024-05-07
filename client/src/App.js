import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import UploadData from './pages/UploadData';
import Transactions from './pages/Transactions';
import { AuthProvider } from './components/AuthContext';
import './App.css';
import MontlyTransactions from './pages/MontlyTransactions';
import WeeklyTransactions from './pages/WeeklyTransactions';
import TransactionAnalysis from './components/TransactionAnalysis';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <Routes>
                        <Route path="/sign-up" element={<SignUp />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/upload-data" element={<UploadData />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/monthly-transactions" element={<MontlyTransactions />} />
                        <Route path="/weekly-transactions" element={<WeeklyTransactions />} />
                        <Route path="/analysis" element={<TransactionAnalysis />} />            
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
