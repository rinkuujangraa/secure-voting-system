'use client';
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Vote, Clock, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  isActive: boolean;
}

interface Candidate {
  _id: string;
  name: string;
  party: string;
  voteCount: number;
}

interface VotePageProps {
  params: {
    id: string;
  };
}

export default function VotePage({ params }: VotePageProps) {
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchElectionAndCandidates();
  }, [params.id]);

  const fetchElectionAndCandidates = async () => {
    try {
      // Fetch election details
      const electionsResponse = await fetch('/api/elections');
      const electionsResult = await electionsResponse.json();

      if (electionsResult.success) {
        const currentElection = electionsResult.data.find((e: Election) => e._id === params.id);
        
        if (!currentElection) {
          setError('Election not found');
          setLoading(false);
          return;
        }

        setElection(currentElection);

        // Check if election is active
        if (!currentElection.isActive) {
          setError('This election is not currently active for voting');
          setLoading(false);
          return;
        }

        // Fetch candidates
        const candidatesResponse = await fetch(`/api/candidates?electionId=${params.id}`);
        const candidatesResult = await candidatesResponse.json();

        if (candidatesResult.success) {
          setCandidates(candidatesResult.data);
        } else {
          setError(candidatesResult.error || 'Failed to load candidates');
        }
      } else {
        setError(electionsResult.error || 'Failed to load election');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate before voting');
      return;
    }

    setVoting(true);
    setError('');

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: selectedCandidate,
          electionId: params.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Your vote has been cast successfully!');
        setTimeout(() => {
          router.push('/user/dashboard');
        }, 3000);
      } else {
        setError(result.error || 'Failed to cast vote');
      }
    } catch (err) {
      setError('Network error occurred while voting');
    } finally {
      setVoting(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voting interface...</p>
        </div>
      </div>
    );
  }

  if (error && !election) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Voting Interface</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link href="/user/elections" className="btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Elections
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vote Cast Successfully!</h2>
        <p className="text-gray-600 mb-4">{success}</p>
        <p className="text-sm text-gray-500 mb-6">Redirecting to dashboard...</p>
        <Link href="/user/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link 
        href="/user/elections" 
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Elections
      </Link>

      {/* Election Header */}
      {election && (
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{election.title}</h1>
              <p className="text-gray-600">{election.description}</p>
            </div>
            <span className="badge-green">Active Now</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            Voting ends: {formatDate(election.endDate)}
          </div>
        </div>
      )}

      {/* Voting Instructions */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Vote className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Voting Instructions</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Select one candidate from the list below</li>
              <li>• Review your selection carefully before casting your vote</li>
              <li>• You can only vote once in this election</li>
              <li>• Your vote is encrypted and secure</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Candidates List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Your Candidate</h2>
        
        {candidates.length > 0 ? (
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <label
                key={candidate._id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedCandidate === candidate._id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="candidate"
                  value={candidate._id}
                  checked={selectedCandidate === candidate._id}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-4 flex items-center justify-center ${
                  selectedCandidate === candidate._id
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}>
                  {selectedCandidate === candidate._id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                  <p className="text-gray-600">{candidate.party}</p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No candidates available for this election.</p>
          </div>
        )}
      </div>

      {/* Vote Button */}
      {candidates.length > 0 && (
        <div className="card">
          <div className="text-center">
            <button
              onClick={handleVote}
              disabled={!selectedCandidate || voting}
              className="btn-primary px-8 py-3 text-lg"
            >
              {voting ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Casting Vote...
                </div>
              ) : (
                <div className="flex items-center">
                  <Vote className="w-5 h-5 mr-2" />
                  Cast My Vote
                </div>
              )}
            </button>
            
            {!selectedCandidate && (
              <p className="text-sm text-gray-500 mt-2">Please select a candidate to continue</p>
            )}
            
            <p className="text-xs text-gray-400 mt-3">
              By clicking &quot;Cast My Vote&quot;, you confirm this is your final selection.
              This action cannot be undone.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}