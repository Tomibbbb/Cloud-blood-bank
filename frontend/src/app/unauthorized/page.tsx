'use client';

import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-sm text-gray-600">
              You don't have permission to access this page.
            </p>
            {user && (
              <p className="mt-2 text-sm text-gray-500">
                You are logged in as: <span className="font-medium">{user.role}</span>
              </p>
            )}
          </div>
          
          <div className="mt-6 flex flex-col space-y-3">
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Go Home
            </Link>
            
            {user && (
              <Link
                href={
                  user.role === 'admin' ? '/admin/dashboard' :
                  user.role === 'hospital' ? '/hospital/requests' :
                  user.role === 'donor' ? '/donor/profile' : '/'
                }
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Go to My Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}