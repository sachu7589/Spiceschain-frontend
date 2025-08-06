// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '1008029048131-r2lknmfk4i492hgqm7hjhki1rreeg0ee.apps.googleusercontent.com';

// Load Google OAuth script
const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Initialize Google OAuth
export const initializeGoogleAuth = async () => {
  try {
    await loadGoogleScript();
    
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    return true;
  } catch (error) {
    console.error('Failed to initialize Google Auth:', error);
    return false;
  }
};

// Handle Google Sign In
export const handleGoogleSignIn = async (response) => {
  try {
    const { credential } = response;
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    return {
      success: true,
      data: {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub
      }
    };
  } catch (error) {
    console.error('Google Sign In Error:', error);
    return {
      success: false,
      error: 'Failed to process Google sign in'
    };
  }
};

// Render Google Sign In Button
export const renderGoogleButton = (elementId, callback) => {
  if (window.google && window.google.accounts) {
    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%'
      }
    );
    
    // Set up the callback
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('Google Sign In not displayed or skipped');
      }
    });
  }
}; 