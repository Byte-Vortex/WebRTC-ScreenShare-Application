import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import PrivateRoute from './PrivateRoute';
import AdminLogin from './AdminLogin';
import Userdata from './Userdata';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

function App() {
    const [authToken, setAuthToken] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/admin" element={<AdminLogin setAuthToken={setAuthToken} />} />
                <Route path="/userdata" element={authToken ? <Userdata authToken={authToken} /> : <Navigate to="/admin" />} />
                
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:userid/:token" element={<ResetPassword />} />

                <Route path="/" element={<Login />} />
                <Route path="*" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
