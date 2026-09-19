# Google Drive Integration Setup Guide

This document explains how to set up Google Drive API credentials for the Pharmacy DB system.

## Prerequisites

- A Google Cloud project
- Google Drive API enabled
- Google OAuth 2.0 credentials

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Enter a project name (e.g., "Pharmacy DB")
4. Click "Create"

## Step 2: Enable the Google Drive API

1. In the Google Cloud Console, search for "Google Drive API"
2. Click on "Google Drive API" in the results
3. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, click "Configure Consent Screen" first
4. Choose "Web application" as the application type
5. Set the following:
   - **Name**: Pharmacy DB
   - **Authorized JavaScript origins**: `http://localhost:5173` (or your deployment URL)
   - **Authorized redirect URIs**: `http://localhost:5173/callback` (or your deployment URL)
6. Click "Create"
7. Copy the **Client ID** from the modal

## Step 4: Get the API Key

1. Go to [Google Cloud Console - APIs & Services](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. Copy the generated **API Key**

## Step 5: Update Environment Variables

1. Open the `.env` file in the `frontend` directory
2. Replace the placeholders:
   ```
   VITE_GOOGLE_DRIVE_API_KEY=YOUR_API_KEY_HERE
   VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
   ```

## How It Works

When a user:

1. **Selects and uploads a file**: The file is validated and processed by Web Workers to extract drug information
2. **Clicks "Upload Inventory File"**: 
   - A processed Excel file is created with dosage forms and units
   - The processed file is uploaded to a "pharmacy excel" folder in Google Drive
   - The original file is uploaded to the backend database
   - Success notifications are displayed

## Folder Structure

The system will automatically create a folder called **"pharmacy excel"** in the user's Google Drive root directory if it doesn't exist. All processed files will be uploaded there.

## Troubleshooting

### Error: "Google Drive configuration is missing"

- Make sure `VITE_GOOGLE_DRIVE_API_KEY` and `VITE_GOOGLE_CLIENT_ID` are set in `.env`
- Restart the development server after updating `.env`

### Error: "Google authentication failed"

- Ensure you're logged into a Google account
- Check that the OAuth credentials are correctly configured
- Verify the redirect URI in Google Cloud Console matches your app URL

### File not appearing in Google Drive

- Check that the user has granted permission to access Google Drive
- Verify the "pharmacy excel" folder is in the Google Drive root directory
- Check browser console for any API errors

## Security Notes

- Never commit `.env` files with real credentials to version control
- Use `.env.example` as a template for team members
- Rotate API keys regularly
- Restrict API key usage in Google Cloud Console
