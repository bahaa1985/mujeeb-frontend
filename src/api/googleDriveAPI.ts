/**
 * Google Drive API Handler
 * Handles authentication, folder creation/finding, and file uploads
 */

const GOOGLE_DRIVE_FOLDER_NAME = 'pharmacy excel';
const GOOGLE_DRIVE_API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

/**
 * Initialize Google API client
 */
const initializeGoogleApi = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.gapi && window.gapi.client && window.gapi.auth2) {
      resolve();
      return;
    }

    // Load Google API script with proper CSP handling
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (!window.gapi) {
          reject(new Error('Google API script loaded but window.gapi is not available'));
          return;
        }
        
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_DRIVE_API_KEY,
              clientId: GOOGLE_CLIENT_ID,
              scope: 'https://www.googleapis.com/auth/drive.file',
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
              ux_mode: 'redirect',
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google API library. Check network connection and CSP settings.'));
      };
      
      script.onabort = () => {
        reject(new Error('Google API script loading was aborted'));
      };
      
      document.head.appendChild(script);
    } else {
      // Script already loaded, just initialize
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: GOOGLE_DRIVE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            ux_mode: 'redirect',
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }
  });
};

/**
 * Authenticate user with Google
 */
const authenticateGoogle = async (): Promise<void> => {
  try {
    const auth2 = window.gapi.auth2.getAuthInstance();
    if (!auth2) {
      throw new Error('Auth2 instance not available. Please try again.');
    }
    
    if (!auth2.isSignedIn.get()) {
      const result = await auth2.signIn();
      if (!result) {
        throw new Error('Google Sign-In was cancelled by user');
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Google authentication failed: ${error.message}`);
    }
    throw new Error('Google authentication failed. Please try again.');
  }
};

/**
 * Find or create the 'pharmacy excel' folder
 */
const findOrCreateFolder = async (): Promise<string> => {
  try {
    // Search for existing folder
    const response = await window.gapi.client.drive.files.list({
      q: `name="${GOOGLE_DRIVE_FOLDER_NAME}" and mimeType="application/vnd.google-apps.folder" and trashed=false`,
      spaces: 'drive',
      pageSize: 1,
      fields: 'files(id, name)',
    });

    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    // Create folder if not found
    const createResponse: any = await window.gapi.client.drive.files.create({
      resource: {
        name: GOOGLE_DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    if (!createResponse.result || !createResponse.result.id) {
      throw new Error('Failed to create folder - no ID returned');
    }

    return createResponse.result.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to find or create folder: ${error.message}`);
    }
    throw new Error('Failed to find or create folder');
  }
};

/**
 * Upload file to Google Drive
 */
const uploadFileToGoogleDrive = async (file: File, folderId: string): Promise<{ fileId: string; webViewLink: string }> => {
  try {
    const fileMetadata = {
      name: file.name,
      parents: [folderId],
    };

    const media = {
      mimeType: file.type,
    };

    const response: any = await window.gapi.client.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    if (!response.result || !response.result.id) {
      throw new Error('Failed to create file - no ID returned');
    }

    // Upload file content using multipart upload
    const auth2 = window.gapi.auth2.getAuthInstance();
    const currentUser = auth2.currentUser.get();
    const authResponse = currentUser.getAuthResponse();
    
    if (!authResponse.id_token) {
      throw new Error('No authentication token available');
    }

    const fileData = await file.arrayBuffer();
    const uploadResponse = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${response.result.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authResponse.id_token}`,
          'Content-Type': file.type,
        },
        body: fileData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status ${uploadResponse.status}: ${uploadResponse.statusText}`);
    }

    return {
      fileId: response.result.id,
      webViewLink: response.result.webViewLink,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    throw new Error('Failed to upload file');
  }
};

/**
 * Main upload handler
 */
export const googleDriveAPI = {
  /**
   * Upload processed Excel file to Google Drive 'pharmacy excel' folder
   */
  uploadProcessedExcelFile: async (file: File): Promise<{ fileId: string; webViewLink: string }> => {
    try {
      // Validate environment variables
      if (!GOOGLE_DRIVE_API_KEY || !GOOGLE_CLIENT_ID) {
        throw new Error(
          'Google Drive configuration is missing. Please set VITE_GOOGLE_DRIVE_API_KEY and VITE_GOOGLE_CLIENT_ID in environment variables.'
        );
      }

      // Initialize Google API
      await initializeGoogleApi();

      // Authenticate user
      await authenticateGoogle();

      // Find or create 'pharmacy excel' folder
      const folderId = await findOrCreateFolder();

      // Upload file to the folder
      const uploadResult = await uploadFileToGoogleDrive(file, folderId);

      return uploadResult;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during Google Drive upload');
    }
  },

  /**
   * Check if user is authenticated with Google
   */
  isAuthenticated: (): boolean => {
    try {
      if (!window.gapi || !window.gapi.auth2) {
        return false;
      }
      const auth2 = window.gapi.auth2.getAuthInstance();
      return auth2 && auth2.isSignedIn.get();
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  },

  /**
   * Sign out from Google
   */
  signOut: async (): Promise<void> => {
    try {
      if (window.gapi && window.gapi.auth2) {
        const auth2 = window.gapi.auth2.getAuthInstance();
        if (auth2) {
          await auth2.signOut();
        }
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      throw new Error('Failed to sign out from Google');
    }
  },
};
