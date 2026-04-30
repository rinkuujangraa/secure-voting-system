'use client';
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  Vote,
  Filter
} from 'lucide-react';

interface Election {
  _id: string;
  title: string;
  status: string;
}

interface Candidate {
  _id: string;
  name: string;
  party: string;
  voteCount: number;
  electionId: {
    _id: string;
    title: string;
    status: string;
  };
}

export default function CandidatesManagementPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string>('');
  
  const searchParams = useSearchParams();

  // Add candidate form
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    party: '',
    electionId: ''
  });

  useEffect(() => {
    fetchElections();
    const electionId = searchParams.get('electionId');
    if (electionId) {
      setSelectedElection(electionId);
      setNewCandidate(prev => ({ ...prev, electionId }));
    }
  }, [searchParams]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedElection) {
      fetchCandidates();
    } else {
      fetchAllCandidates();
    }
  }, [selectedElection]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm]);

  const fetchElections = async () => {
    try {
      const response = await fetch('/api/admin/elections');
      const result = await response.json();
      
      if (result.success) {
        setElections(result.data);
      }
    } catch (err) {
      console.error('Error fetching elections:', err);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/candidates?electionId=${selectedElection}`);
      const result = await response.json();

      if (result.success) {
        setCandidates(result.data);
      } else {
        setError(result.error || 'Failed to load candidates');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/candidates');
      const result = await response.json();

      if (result.success) {
        setCandidates(result.data);
      } else {
        setError(result.error || 'Failed to load candidates');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.party.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCandidates(filtered);
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('add');

    try {
      const response = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCandidate),
      });

      const result = await response.json();

      if (result.success) {
        setNewCandidate({ name: '', party: '', electionId: selectedElection || '' });
        setShowAddForm(false);
        if (selectedElection) {
          fetchCandidates();
        } else {
          fetchAllCandidates();
        }
      } else {
        setError(result.error || 'Failed to add candidate');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      return;
    }

    setActionLoading(candidateId);
    try {
      const response = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setCandidates(candidates.filter(c => c._id !== candidateId));
      } else {
        setError(result.error || 'Failed to delete candidate');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setActionLoading('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge-green">Active</span>;
      case 'upcoming':
        return <span className="badge-yellow">Upcoming</span>;
      case 'completed':
        return <span className="badge-red">Completed</span>;
      default:
        return <span className="badge-blue">{status}</span>;
    }
  };

  const canModifyCandidates = (status: string) => {
    return status === 'upcoming';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates Management</h1>
          <p className="text-gray-600">Add and manage candidates for elections</p>
        </div>
      </div>

      {/* Election Filter and Add Button */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label htmlFor="election-filter" className="form-label">
              Filter by Election
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                id="election-filter"
                value={selectedElection}
                onChange={(e) => setSelectedElection(e.target.value)}
                className="input pl-10"
              >
                <option value="">All Elections</option>
                {elections.map((election) => (
                  <option key={election._id} value={election._id}>
                    {election.title} ({election.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            {selectedElection && canModifyCandidates(elections.find(e => e._id === selectedElection)?.status || '') && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Candidate
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Add Candidate Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Candidate</h3>
          <form onSubmit={handleAddCandidate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label htmlFor="candidate-name" className="form-label">
                  Candidate Name *
                </label>
                <input
                  id="candidate-name"
                  type="text"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Enter candidate name"
                  required
                  disabled={actionLoading === 'add'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="candidate-party" className="form-label">
                  Party/Affiliation *
                </label>
                <input
                  id="candidate-party"
                  type="text"
                  value={newCandidate.party}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, party: e.target.value }))}
                  className="input"
                  placeholder="Enter party or affiliation"
                  required
                  disabled={actionLoading === 'add'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="candidate-election" className="form-label">
                  Election *
                </label>
                <select
                  id="candidate-election"
                  value={newCandidate.electionId}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, electionId: e.target.value }))}
                  className="input"
                  required
                  disabled={actionLoading === 'add'}
                >
                  <option value="">Select Election</option>
                  {elections
                    .filter(e => e.status === 'upcoming')
                    .map((election) => (
                      <option key={election._id} value={election._id}>
                        {election.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewCandidate({ name: '', party: '', electionId: selectedElection || '' });
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
                {actionLoading === 'add' ? 'Adding...' : 'Add Candidate'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading candidates...</p>
          </div>
        </div>
      ) : (
        /* Candidates List */
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Candidates ({filteredCandidates.length})
            </h3>
          </div>

          {filteredCandidates.length > 0 ? (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <div key={candidate._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                        {getStatusBadge(candidate.electionId.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{candidate.party}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{candidate.electionId.title}</span>
                        </div>
                        <div className="flex items-center">
                          <Vote className="w-4 h-4 mr-1" />
                          <span>{candidate.voteCount} votes</span>
                        </div>
                      </div>
                    </div>

                    {canModifyCandidates(candidate.electionId.status) && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleDeleteCandidate(candidate._id)}
                          disabled={actionLoading === candidate._id}
                          className="btn-danger text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {actionLoading === candidate._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No candidates match your search' : 'No Candidates Found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search term.'
                  : selectedElection 
                    ? 'No candidates have been added to this election yet.'
                    : 'No candidates exist in the system yet.'
                }
              </p>
              
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn-secondary"
                >
                  Clear Search
                </button>
              ) : selectedElection && canModifyCandidates(elections.find(e => e._id === selectedElection)?.status || '') ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Candidate
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Candidate Management Rules</h3>
        <div className="text-blue-800 text-sm space-y-1">
          <p>• Candidates can only be added to upcoming elections</p>
          <p>• Once an election starts, candidates cannot be modified or deleted</p>
          <p>• Candidate names must be unique within each election</p>
          <p>• Deleting a candidate will remove all associated vote data</p>
        </div>
      </div>
    </div>
  );
}