import React, { useEffect, useRef } from 'react';
import { initializeGoogleAuth, handleGoogleSignIn } from '../services/googleAuth';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const GoogleAuthLogin = () => {
  const { login } = useAuth();
  const googleButtonRef = useRef(null);

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      position: 'top-end',
      timer: 5000,
      timerProgressBar: true,
      toast: true,
      showConfirmButton: false,
      allowOutsideClick: false,
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Login Failed!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
  };

  const showNotRegisteredAlert = (email) => {
    Swal.fire({
      title: 'Account Not Found',
      text: `No account found with email: ${email}. Please register first.`,
      icon: 'warning',
      confirmButtonText: 'Register Now',
      confirmButtonColor: '#3b82f6',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#6b7280',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to registration page - user can choose buyer or farmer
        window.location.href = '/register/farmer'; // Default to farmer registration
      }
    });
  };

  useEffect(() => {
    const initGoogleAuth = async () => {
      const success = await initializeGoogleAuth();
      if (success) {
        // Override the global callback to handle login
        window.google.accounts.id.initialize({
          client_id: '1008029048131-r2lknmfk4i492hgqm7hjhki1rreeg0ee.apps.googleusercontent.com',
          callback: async (response) => {
            const result = await handleGoogleSignIn(response);
            if (result.success) {
              try {
                // Only send email to backend for verification
                const loginResponse = await authAPI.googleLogin({ email: result.data.email });
                
                if (loginResponse.data.exists) {
                  // User exists, proceed with login
                  showSuccessAlert('Login successful! Welcome back.');
                  
                  // Add a small delay to ensure the alert is visible before redirecting
                  setTimeout(() => {
                    // Use the auth context to login
                    login(loginResponse.data.token, loginResponse.data.user);
                  }, 1000);
                } else {
                  // User doesn't exist, show registration alert
                  showNotRegisteredAlert(result.data.email);
                }
              } catch (error) {
                console.error('Google login error:', error);
                const errorMessage = error.response?.data?.message || 'Google login failed. Please try again.';
                showErrorAlert(errorMessage);
              }
            } else {
              console.error('Google sign in failed:', result.error);
              showErrorAlert('Google sign in failed. Please try again.');
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
  }, [login]);

  return (
    <div ref={googleButtonRef}></div>
  );
};

export default GoogleAuthLogin; 