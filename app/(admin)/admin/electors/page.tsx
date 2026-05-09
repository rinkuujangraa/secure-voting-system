'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Filter,
  AlertCircle
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  hasVoted: boolean;
  createdAt: string;
}

export default function ElectorsManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string>('');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.error || 'Failed to load users');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('add');
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`${newUser.role === 'admin' ? 'Admin' : 'Elector'} added successfully!`);
        setNewUser({ name: '', email: '', password: '', role: 'user' });
        setShowAddForm(false);
        fetchUsers();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to add user');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(userId);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setUsers(users.filter(u => u._id !== userId));
        setSuccess('User deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setActionLoading('');
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin'
      ? <span className="badge-blue">Admin</span>
      : <span className="badge-green">Elector</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Electors Management</h1>
          <p className="text-gray-600">Manage voters and administrators</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Elector
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="card bg-green-50 border border-green-200">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input pl-10"
              >
                <option value="all">All Roles</option>
                <option value="user">Electors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Elector or Admin</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="user-name" className="form-label">
                  Full Name *
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Enter full name"
                  required
                  minLength={2}
                  maxLength={50}
                  disabled={actionLoading === 'add'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-email" className="form-label">
                  Email Address *
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="Enter email address"
                  required
                  disabled={actionLoading === 'add'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-password" className="form-label">
                  Password *
                </label>
                <input
                  id="user-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="input"
                  placeholder="Enter password (min 6 characters)"
                  required
                  minLength={6}
                  disabled={actionLoading === 'add'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-role" className="form-label">
                  Role *
                </label>
                <select
                  id="user-role"
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                  className="input"
                  required
                  disabled={actionLoading === 'add'}
                >
                  <option value="user">Elector (Voter)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewUser({ name: '', email: '', password: '', role: 'user' });
                  setError('');
                }}
                className="btn-secondary"
                disabled={actionLoading === 'add'}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={actionLoading === 'add'}
              >
                {actionLoading === 'add' ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h3>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.hasVoted ? (
                          <span className="flex items-center text-green-600">
                            <UserCheck className="w-4 h-4 mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          disabled={actionLoading === user._id}
                          className="text-red-600 hover:text-red-800 font-medium text-sm inline-flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {actionLoading === user._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || roleFilter !== 'all'
                  ? 'No users match your search criteria.'
                  : 'No users have been created yet.'
                }
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First User
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">User Management Rules</h3>
        <div className="text-blue-800 text-sm space-y-1">
          <p>• Electors can vote in elections</p>
          <p>• Admins can create elections, add candidates, and manage the system</p>
          <p>• Users who have already voted cannot be deleted (election integrity)</p>
          <p>• Email addresses must be unique</p>
        </div>
      </div>
    </div>
  );
}
