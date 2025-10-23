import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // [cite: sakshamkumar28/doxy-updated/DOXY-Updated-d8274377137c426ade7ad3fb508a00bdbf7e8137/frontend/src/hooks/useAuth.js]

const FullPageLoader = () => ( // Simple loader
    <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
    </div>
);

const AuthWrapperForVideoCall = ({ children }) => {
    // Check authentication status for both user types
    const { user: loggedInUser, loading: userLoading, error: userError } = useAuth('user'); // [cite: sakshamkumar28/doxy-updated/DOXY-Updated-d8274377137c426ade7ad3fb508a00bdbf7e8137/frontend/src/hooks/useAuth.js]
    const { user: loggedInDoctor, loading: doctorLoading, error: doctorError } = useAuth('doctor'); // [cite: sakshamkumar28/doxy-updated/DOXY-Updated-d8274377137c426ade7ad3fb508a00bdbf7e8137/frontend/src/hooks/useAuth.js]

    const isLoading = userLoading || doctorLoading;

    if (isLoading) {
        return <FullPageLoader />;
    }

    // Determine who is authenticated and their role
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

    // If neither is authenticated after loading, redirect to role selection
    if (!authenticatedUser) {
        console.log("AuthWrapper: Not authenticated, redirecting to role select.");
        // Redirect to choose login type, passing the intended destination
        const intendedPath = window.location.pathname + window.location.search;
        return <Navigate to={`/role?action=login&redirect=${encodeURIComponent(intendedPath)}`} replace />;
    }
    console.log(`AuthWrapper: Preparing to render VideoCall for role: ${userRole}`);
 console.log(`AuthWrapper: Passing authenticatedUser ID: ${authenticatedUser?._id}`);

 return React.cloneElement(children, { authenticatedUser, userRole });
};
export default AuthWrapperForVideoCall;
