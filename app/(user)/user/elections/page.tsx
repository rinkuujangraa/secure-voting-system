'use client';
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Vote, Calendar, Clock, CheckCircle, BarChart3, Search, Filter } from 'lucide-react';

interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  isActive: boolean;
}

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [filteredElections, setFilteredElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchElections();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    filterElections();
  }, [elections, searchTerm, statusFilter]);

  const fetchElections = async () => {
    try {
      const response = await fetch('/api/elections');
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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(election =>
        election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        election.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(election => election.isActive);
      } else {
        filtered = filtered.filter(election => election.status === statusFilter);
      }
    }

    setFilteredElections(filtered);
  };

  const getStatusBadge = (election: Election) => {
    if (election.isActive) {
      return <span className="badge-green">Active Now</span>;
    }
    if (election.status === 'upcoming') {
      return <span className="badge-yellow">Upcoming</span>;
    }
    if (election.status === 'completed') {
      return <span className="badge-red">Completed</span>;
    }
    return <span className="badge-blue">{election.status}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getElectionActions = (election: Election) => {
    if (election.isActive) {
      return (
        <div className="flex space-x-2">
          <Link 
            href={`/user/vote/${election._id}`}
            className="btn-primary text-sm"
          >
            <Vote className="w-4 h-4 mr-1" />
            Vote
          </Link>
          <Link 
            href={`/user/results?electionId=${election._id}`}
            className="btn-secondary text-sm"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Results
          </Link>
        </div>
      );
    }
    
    if (election.status === 'completed') {
      return (
        <Link 
          href={`/user/results?electionId=${election._id}`}
          className="btn-secondary text-sm"
        >
          <BarChart3 className="w-4 h-4 mr-1" />
          View Results
        </Link>
      );
    }

    return (
      <div className="text-sm text-gray-500 flex items-center">
        <Clock className="w-4 h-4 mr-1" />
        Voting not yet available
      </div>
    );
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Elections</h1>
        <p className="text-gray-600">Browse and participate in available elections</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
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

          {/* Status Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-10"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
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
            <div key={election._id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{election.title}</h3>
                  <p className="text-gray-600 mb-3">{election.description}</p>
                </div>
                <div className="ml-4">
                  {getStatusBadge(election)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Starts: {formatDate(election.startDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Ends: {formatDate(election.endDate)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {election.isActive && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Voting is currently open
                    </div>
                  )}
                  {election.status === 'upcoming' && (
                    <div className="flex items-center text-yellow-600">
                      <Clock className="w-4 h-4 mr-1" />
                      Voting will open on {formatDate(election.startDate)}
                    </div>
                  )}
                  {election.status === 'completed' && (
                    <div className="flex items-center text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Voting has ended
                    </div>
                  )}
                </div>
                
                {getElectionActions(election)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No elections match your search' : 'No Elections Available'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria or filters.'
              : 'There are currently no elections available for participation.'
            }
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}