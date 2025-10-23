import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; //

const FullPageLoader = () => ( // Simple loader
    <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
    </div>
);

const AuthWrapperForVideoCall = ({ children }) => {
    // Check authentication status for both user types
    const { user: loggedInUser, loading: userLoading, error: userError } = useAuth('user'); //
    const { user: loggedInDoctor, loading: doctorLoading, error: doctorError } = useAuth('doctor'); //

    const isLoading = userLoading || doctorLoading;
    const isAuthenticated = !!loggedInUser || !!loggedInDoctor; // True if either is logged in

    if (isLoading) {
        return <FullPageLoader />;
    }

    // If neither is authenticated after loading, redirect to role selection
    if (!isAuthenticated) {
        console.log("AuthWrapper: Not authenticated, redirecting to role select.");
        return <Navigate to="/role?action=login" replace />; // Redirect to choose login type
    }

    // If authenticated as either user or doctor, render the VideoCall component
    console.log("AuthWrapper: Authenticated, rendering children.");
    return children;
};

export default AuthWrapperForVideoCall;