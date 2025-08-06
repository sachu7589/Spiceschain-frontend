import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeGoogleAuth, handleGoogleSignIn } from '../services/googleAuth';

const GoogleAuth = ({ userType, onGoogleSuccess }) => {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const initGoogleAuth = async () => {
      const success = await initializeGoogleAuth();
      if (success) {
        // Override the global callback to handle our specific use case
        window.google.accounts.id.initialize({
          client_id: '1008029048131-r2lknmfk4i492hgqm7hjhki1rreeg0ee.apps.googleusercontent.com',
          callback: async (response) => {
            const result = await handleGoogleSignIn(response);
            if (result.success) {
              // Store Google data in sessionStorage for the registration form
              sessionStorage.setItem('googleAuthData', JSON.stringify(result.data));
              
              // Redirect to the appropriate registration page with Google data
              if (userType === 'buyer') {
                navigate('/register/buyer/google');
              } else if (userType === 'farmer') {
                navigate('/register/farmer/google');
              }
            } else {
              console.error('Google sign in failed:', result.error);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the Google button
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: '100%'
          });
        }
      }
    };

    initGoogleAuth();
  }, [navigate, userType]);

  return (
    <div className="mb-6">
      <div ref={googleButtonRef}></div>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or continue with email</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuth; 