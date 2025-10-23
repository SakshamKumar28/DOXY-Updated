import React from 'react';
import { Navigate } from 'react-router-dom';
// Changed back to relative path to fix build error
import { useAuth } from '../hooks/useAuth';

const FullPageLoader = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
    </div>
);

// Changed to accept a 'render' prop instead of 'children'
const AuthWrapperForVideoCall = ({ render }) => {
    const { user: loggedInUser, loading: userLoading, error: userError } = useAuth('user');
    const { user: loggedInDoctor, loading: doctorLoading, error: doctorError } = useAuth('doctor');

    const isLoading = userLoading || doctorLoading;

    if (isLoading) {
        return <FullPageLoader />;
    }

    let authenticatedUser = null;
    let userRole = null;

    if (loggedInDoctor) {
        authenticatedUser = loggedInDoctor;
        userRole = 'doctor';
        console.log("AuthWrapper: Authenticated as DOCTOR:", authenticatedUser?._id);
    } else if (loggedInUser) {
        authenticatedUser = loggedInUser;
        userRole = 'user';
        console.log("AuthWrapper: Authenticated as USER:", authenticatedUser?._id);
    }

    if (!authenticatedUser) {
        console.log("AuthWrapper: Not authenticated, redirecting to role select.");
        const intendedPath = window.location.pathname + window.location.search;
        return <Navigate to={`/role?action=login&redirect=${encodeURIComponent(intendedPath)}`} replace />;
    }

    console.log(`AuthWrapper: Calling render prop for role: ${userRole}`);
    console.log(`AuthWrapper: Passing authenticatedUser ID: ${authenticatedUser?._id}`);

    // Call the render prop function, passing the authenticated data
    // Ensure the 'render' prop is actually a function before calling it
    if (typeof render !== 'function') {
        console.error("AuthWrapper Error: 'render' prop is not a function!");
        // Render an error message or null instead of crashing
        return <div className="h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error: Invalid component setup in App.jsx for Video Call route.</div>;
    }

    try {
        return render({ authenticatedUser, userRole });
    } catch (e) {
         console.error("AuthWrapper Error: Error occurred while calling the render prop:", e);
         // Render an error message if the render prop itself throws an error
         return <div className="h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error rendering video call component. Check console.</div>;
    }
};

export default AuthWrapperForVideoCall;

