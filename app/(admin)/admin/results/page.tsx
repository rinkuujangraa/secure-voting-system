'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Trophy, 
  RefreshCw, 
  Download,
  Clock,
  Vote,
  Activity
} from 'lucide-react';

interface Candidate {
  _id: string;
  name: string;
  party: string;
  voteCount: number;
  percentage: string;
  percentageOfRegistered: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface VoteDistribution {
  hourlyVotes: Record<string, number>;
  firstVote: string | null;
  lastVote: string | null;
}

interface DetailedResults {
  election: Election;
  statistics: {
    totalVotes: number;
    totalRegisteredUsers: number;
    turnoutPercentage: string;
    totalCandidates: number;
  };
  candidates: Candidate[];
  winner: Candidate | null;
  voteDistribution: VoteDistribution;
  lastUpdated: string;
}

interface ElectionListItem {
  _id: string;
  title: string;
  status: string;
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<DetailedResults | null>(null);
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
      const response = await fetch('/api/admin/elections');
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
      const response = await fetch(`/api/admin/results?electionId=${electionId}`);
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

  const exportResults = () => {
    if (!results) return;

    const csvContent = [
      ['Candidate Name', 'Party', 'Votes', 'Percentage', '% of Registered'],
      ...results.candidates.map(candidate => [
        candidate.name,
        candidate.party,
        candidate.voteCount.toString(),
        candidate.percentage + '%',
        candidate.percentageOfRegistered + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${results.election.title.replace(/\s+/g, '_')}_results.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Election Results</h1>
          <p className="text-gray-600">Detailed analytics and voting results</p>
        </div>
        
        {results && (
          <button
            onClick={exportResults}
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        )}
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
              <option value="">Choose an election to view detailed results</option>
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
            <p className="text-gray-600">Loading detailed results...</p>
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
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{results.election.title}</h2>
                <p className="text-gray-600 mb-3">{results.election.description}</p>
              </div>
              {getStatusBadge(results.election.status)}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Started: {formatDate(results.election.startDate)}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Ends: {formatDate(results.election.endDate)}
              </div>
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Created: {formatDate(results.election.createdAt)}
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Vote className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{results.statistics.totalVotes}</p>
                  <p className="text-gray-600">Total Votes</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{results.statistics.totalRegisteredUsers}</p>
                  <p className="text-gray-600">Registered Users</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{results.statistics.turnoutPercentage}%</p>
                  <p className="text-gray-600">Voter Turnout</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{results.statistics.totalCandidates}</p>
                  <p className="text-gray-600">Candidates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Winner Announcement */}
          {results.winner && results.statistics.totalVotes > 0 && (
            <div className="card bg-yellow-50 border border-yellow-200">
              <div className="flex items-center space-x-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900">
                    Election Winner: {results.winner.name}
                  </h3>
                  <p className="text-yellow-800">
                    {results.winner.party} • {results.winner.voteCount} votes ({results.winner.percentage}%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Candidates Results */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Detailed Results</h3>
              <div className="text-sm text-gray-500">
                Last updated: {formatDate(results.lastUpdated)}
              </div>
            </div>

            {results.candidates.length > 0 ? (
              <div className="space-y-4">
                {results.candidates.map((candidate, index) => (
                  <div key={candidate._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {index === 0 && results.statistics.totalVotes > 0 && (
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{candidate.name}</h4>
                          <p className="text-gray-600">{candidate.party}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{candidate.voteCount}</p>
                        <p className="text-sm text-gray-600">votes</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>% of Total Votes</span>
                          <span className="font-medium">{candidate.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${candidate.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>% of Registered Users</span>
                          <span className="font-medium">{candidate.percentageOfRegistered}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${candidate.percentageOfRegistered}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No votes have been cast yet.</p>
              </div>
            )}
          </div>

          {/* Vote Timeline */}
          {results.voteDistribution.firstVote && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vote Timeline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span>First Vote: {formatDate(results.voteDistribution.firstVote)}</span>
                </div>
                {results.voteDistribution.lastVote && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Latest Vote: {formatDate(results.voteDistribution.lastVote)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Real-time Notice */}
          {results.election.status === 'active' && (
            <div className="card bg-green-50 border border-green-200">
              <div className="flex items-center space-x-2 text-green-700">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Live Results</span>
              </div>
              <p className="text-green-600 text-sm mt-2">
                These results update in real-time as votes are cast. All data is encrypted and secure.
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
          <p className="text-gray-600 mb-4">Choose an election from the dropdown above to view detailed results and analytics.</p>
          
          {elections.length === 0 && (
            <div className="mt-6">
              <p className="text-gray-500 mb-4">No elections with available results found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}