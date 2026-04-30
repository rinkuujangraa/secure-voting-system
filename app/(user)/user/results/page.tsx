'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, TrendingUp, Users, Calendar, Trophy, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Candidate {
  _id: string;
  name: string;
  party: string;
  voteCount: number;
  percentage: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface ElectionResults {
  election: Election;
  totalVotes: number;
  candidates: Candidate[];
  lastUpdated: string;
}

interface ElectionListItem {
  _id: string;
  title: string;
  status: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [elections, setElections] = useState<ElectionListItem[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchElections();
    const electionId = searchParams.get('electionId');
    if (electionId) {
      setSelectedElectionId(electionId);
      fetchResults(electionId);
    }
  }, [searchParams]);

  const fetchElections = async () => {
    try {
      const response = await fetch('/api/elections');
      const result = await response.json();

      if (result.success) {
        // Filter elections that can show results (active or completed)
        const availableElections = result.data.filter((election: any) => 
          election.status === 'active' || election.status === 'completed'
        );
        setElections(availableElections);
      }
    } catch (err) {
      console.error('Error fetching elections:', err);
    }
  };

  const fetchResults = async (electionId: string) => {
    if (!electionId) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/results?electionId=${electionId}`);
      const result = await response.json();

      if (result.success) {
        setResults(result.data);
      } else {
        setError(result.error || 'Failed to load results');
        setResults(null);
      }
    } catch (err) {
      setError('Network error occurred');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleElectionChange = (electionId: string) => {
    setSelectedElectionId(electionId);
    if (electionId) {
      fetchResults(electionId);
    } else {
      setResults(null);
    }
  };

  const refreshResults = () => {
    if (selectedElectionId) {
      fetchResults(selectedElectionId);
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge-green">Active</span>;
      case 'completed':
        return <span className="badge-red">Completed</span>;
      default:
        return <span className="badge-blue">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Election Results</h1>
        <p className="text-gray-600">View real-time and final election results</p>
      </div>

      {/* Election Selector */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <label htmlFor="election-select" className="form-label">
              Select Election
            </label>
            <select
              id="election-select"
              value={selectedElectionId}
              onChange={(e) => handleElectionChange(e.target.value)}
              className="input"
            >
              <option value="">Choose an election to view results</option>
              {elections.map((election) => (
                <option key={election._id} value={election._id}>
                  {election.title} ({election.status})
                </option>
              ))}
            </select>
          </div>
          
          {selectedElectionId && (
            <button
              onClick={refreshResults}
              disabled={loading}
              className="btn-secondary flex items-center mt-6 sm:mt-0"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center space-x-2 text-red-600">
            <BarChart3 className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && !loading && (
        <div className="space-y-6">
          {/* Election Info */}
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{results.election.title}</h2>
                <p className="text-gray-600">{results.election.description}</p>
              </div>
              {getStatusBadge(results.election.status)}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Started: {formatDate(results.election.startDate)}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Ends: {formatDate(results.election.endDate)}
              </div>
            </div>
          </div>

          {/* Vote Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{results.totalVotes}</p>
                  <p className="text-gray-600">Total Votes Cast</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{results.candidates.length}</p>
                  <p className="text-gray-600">Candidates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Candidates Results */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Candidate Results</h3>
              <div className="text-sm text-gray-500">
                Last updated: {formatDate(results.lastUpdated)}
              </div>
            </div>

            {results.candidates.length > 0 ? (
              <div className="space-y-4">
                {results.candidates.map((candidate, index) => (
                  <div key={candidate._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {index === 0 && results.totalVotes > 0 && (
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                          <p className="text-gray-600">{candidate.party}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{candidate.voteCount}</p>
                        <p className="text-sm text-gray-600">{candidate.percentage}%</p>
                      </div>
                    </div>
                    
                    {/* Vote Percentage Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${candidate.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No votes have been cast yet.</p>
              </div>
            )}
          </div>

          {/* Real-time Notice */}
          {results.election.status === 'active' && (
            <div className="card bg-green-50 border border-green-200">
              <div className="flex items-center space-x-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Live Results</span>
              </div>
              <p className="text-green-600 text-sm mt-2">
                These results update in real-time as votes are cast. Final results will be available when voting ends.
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Election Selected */}
      {!selectedElectionId && !loading && (
        <div className="text-center py-12 card">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Election</h3>
          <p className="text-gray-600 mb-4">Choose an election from the dropdown above to view its results.</p>
          
          {elections.length === 0 && (
            <div className="mt-6">
              <p className="text-gray-500 mb-4">No elections with available results found.</p>
              <Link href="/user/elections" className="btn-primary">
                View All Elections
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}