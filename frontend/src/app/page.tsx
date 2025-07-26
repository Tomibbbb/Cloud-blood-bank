export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Blood Bank Management System
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Connecting donors, hospitals, and blood banks for life-saving donations
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Get Started</h3>
              <div className="mt-4 space-y-4">
                <a
                  href="/register"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Register as Donor/Hospital
                </a>
                <a
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign In
                </a>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Features</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>• Donor registration and profile management</li>
                <li>• Hospital blood request system</li>
                <li>• Real-time blood inventory tracking</li>
                <li>• Secure role-based access control</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}