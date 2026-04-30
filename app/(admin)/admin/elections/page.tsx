'use client';
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Play,
  Square
} from 'lucide-react';

interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  isActive: boolean;
  canStart: boolean;
  canEnd: boolean;
  createdAt: string;
}

export default function ElectionsManagementPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [filteredElections, setFilteredElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string>('');

  useEffect(() => {
    fetchElections();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    filterElections();
  }, [elections, searchTerm, statusFilter]);

  const fetchElections = async () => {
    try {
      const response = await fetch('/api/admin/elections');
      const result = await response.json();

      if (result.success) {
        setElections(result.data);
      } else {
        setError(result.error || 'Failed to load elections');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterElections = () => {
    let filtered = elections;

    if (searchTerm) {
      filtered = filtered.filter(election =>
        election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        election.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(election => election.status === statusFilter);
    }

    setFilteredElections(filtered);
  };

  const handleStatusUpdate = async (electionId: string, newStatus: string) => {
    setActionLoading(electionId);
    try {
      const response = await fetch(`/api/admin/elections/${electionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh elections list
        fetchElections();
      } else {
        setError(result.error || 'Failed to update election status');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (electionId: string) => {
    if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return;
    }

    setActionLoading(electionId);
    try {
      const response = await fetch(`/api/admin/elections/${electionId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setElections(elections.filter(e => e._id !== electionId));
      } else {
        setError(result.error || 'Failed to delete election');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setActionLoading('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (election: Election) => {
    if (election.isActive) {
      return <span className="badge-green">Active</span>;
    }
    if (election.status === 'upcoming') {
      return <span className="badge-yellow">Upcoming</span>;
    }
    if (election.status === 'completed') {
      return <span className="badge-red">Completed</span>;
    }
    return <span className="badge-blue">{election.status}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Elections Management</h1>
          <p className="text-gray-600">Create, manage, and monitor all elections</p>
        </div>
        <Link href="/admin/elections/create" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Election
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search elections..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-10"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredElections.length} of {elections.length} elections
        </div>
      </div>

      {error && (
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Elections List */}
      {filteredElections.length > 0 ? (
        <div className="space-y-4">
          {filteredElections.map((election) => (
            <div key={election._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{election.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{election.description}</p>
                </div>
                <div className="ml-4">
                  {getStatusBadge(election)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Starts: {formatDate(election.startDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Ends: {formatDate(election.endDate)}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Created: {formatDate(election.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* View Results */}
                <Link 
                  href={`/admin/results?electionId=${election._id}`}
                  className="btn-secondary text-sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Results
                </Link>

                {/* Manage Candidates */}
                <Link 
                  href={`/admin/candidates?electionId=${election._id}`}
                  className="btn-secondary text-sm"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Candidates
                </Link>

                {/* Status Actions */}
                {election.canStart && election.status === 'upcoming' && (
                  <button
                    onClick={() => handleStatusUpdate(election._id, 'active')}
                    disabled={actionLoading === election._id}
                    className="btn-primary text-sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    {actionLoading === election._id ? 'Starting...' : 'Start'}
                  </button>
                )}

                {election.canEnd && election.status === 'active' && (
                  <button
                    onClick={() => handleStatusUpdate(election._id, 'completed')}
                    disabled={actionLoading === election._id}
                    className="btn-danger text-sm"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    {actionLoading === election._id ? 'Ending...' : 'End'}
                  </button>
                )}

                {/* Delete (only for upcoming elections with no votes) */}
                {election.status === 'upcoming' && (
                  <button
                    onClick={() => handleDelete(election._id)}
                    disabled={actionLoading === election._id}
                    className="btn-danger text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {actionLoading === election._id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No elections match your search' : 'No Elections Created'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria or filters.'
              : 'Create your first election to get started.'
            }
          </p>
          {searchTerm || statusFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          ) : (
            <Link href="/admin/elections/create" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Election
            </Link>
          )}
        </div>
      )}
    </div>
  );
}