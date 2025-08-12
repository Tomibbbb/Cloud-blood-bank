'use client';

import ProtectedRoute from '../../../components/ProtectedRoute';
import { useState } from 'react';

export default function NHSBloodManagerDashboardPage() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      hospitalName: 'City General Hospital',
      bloodType: 'A+',
      quantity: 3,
      urgency: 'high',
      status: 'pending',
      patientName: 'John Doe',
      reason: 'Emergency surgery',
      requestedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      hospitalName: 'Metro Medical Center',
      bloodType: 'O-',
      quantity: 2,
      urgency: 'critical',
      status: 'approved',
      patientName: 'Jane Smith',
      reason: 'Accident victim',
      requestedAt: '2024-01-14T15:30:00Z',
    },
  ]);

  const [inventory, setInventory] = useState([
    { bloodType: 'A+', units: 45, location: 'Main Storage', expiry: '2024-02-15' },
    { bloodType: 'A-', units: 23, location: 'Main Storage', expiry: '2024-02-10' },
    { bloodType: 'B+', units: 31, location: 'Main Storage', expiry: '2024-02-20' },
    { bloodType: 'B-', units: 12, location: 'Main Storage', expiry: '2024-02-08' },
    { bloodType: 'AB+', units: 8, location: 'Main Storage', expiry: '2024-02-12' },
    { bloodType: 'AB-', units: 5, location: 'Main Storage', expiry: '2024-02-18' },
    { bloodType: 'O+', units: 67, location: 'Main Storage', expiry: '2024-02-25' },
    { bloodType: 'O-', units: 19, location: 'Main Storage', expiry: '2024-02-14' },
  ]);

  const updateRequestStatus = (id: number, newStatus: string) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: newStatus } : request
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'fulfilled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInventoryStatus = (units: number) => {
    if (units < 10) return 'bg-red-100 text-red-800';
    if (units < 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">NHS Blood Manager Dashboard</h1>

          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">R</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                      <dd className="text-lg font-medium text-gray-900">{requests.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {requests.filter(r => r.status === 'pending').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">I</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Units</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {inventory.reduce((sum, item) => sum + item.units, 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">L</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Low Stock</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {inventory.filter(item => item.units < 10).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Blood Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hospital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blood Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.hospitalName}</div>
                        <div className="text-sm text-gray-500">{request.reason}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.bloodType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.quantity} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateRequestStatus(request.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateRequestStatus(request.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Blood Inventory</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              {inventory.map((item) => (
                <div key={item.bloodType} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.bloodType}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInventoryStatus(item.units)}`}>
                      {item.units < 10 ? 'Low' : item.units < 20 ? 'Medium' : 'Good'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>{item.units}</strong> units available</p>
                    <p>Location: {item.location}</p>
                    <p>Expires: {new Date(item.expiry).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}