import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, userType = 'user' }) => {
    const { user, loading, error } = useAuth(userType);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loading && !user && error) {
            // Redirect to appropriate login page
            if (userType === 'doctor') {
                navigate('/doctor/login');
            } else {
                navigate('/user/login');
            }
        }
    }, [user, loading, error, navigate, userType]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="text-red-600 mb-4">Authentication required</div>
                    <div className="text-gray-600">Redirecting to login...</div>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
