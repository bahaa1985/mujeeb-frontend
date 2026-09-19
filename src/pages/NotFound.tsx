import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <p className="text-3xl font-semibold text-white mt-4">
          Page Not Found
        </p>
        <p className="text-gray-400 mt-2">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link
          to="/dashboard"
          className="inline-block mt-8 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};
