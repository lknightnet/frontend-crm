import './App.css';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";

import {AuthProvider, useAuth} from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";

function DefaultRedirect() {
    const { user } = useAuth();
    return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}
function App() {
    return (
        <AuthProvider> {/* 👈 оборачиваем всё приложение */}
            <Router>
                <Routes>
                    <Route path="/" element={<DefaultRedirect />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
