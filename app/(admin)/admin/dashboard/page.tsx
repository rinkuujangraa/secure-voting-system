'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  Vote, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Plus,
  Settings,
  Eye
} from 'lucide-react';

interface DashboardStats {
  totalElections: number;
  activeElections: number;
  upcomingElections: number;
  completedElections: number;
  totalCandidates: number;
  totalVotes: number;
}

interface RecentElection {
  _id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  canStart: boolean;
  canEnd: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalElections: 0,
    activeElections: 0,
    upcomingElections: 0,
    completedElections: 0,
    totalCandidates: 0,
    totalVotes: 0
  });
  const [recentElections, setRecentElections] = useState<RecentElection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch elections
      const electionsResponse = await fetch('/api/admin/elections');
      const electionsResult = await electionsResponse.json();

      if (electionsResult.success) {
        const elections = electionsResult.data;
        setRecentElections(elections.slice(0, 5)); // Show 5 most recent

        // Calculate stats
        const newStats = {
          totalElections: elections.length,
          activeElections: elections.filter((e: RecentElection) => e.status === 'active').length,
          upcomingElections: elections.filter((e: RecentElection) => e.status === 'upcoming').length,
          completedElections: elections.filter((e: RecentElection) => e.status === 'completed').length,
          totalCandidates: 0,
          totalVotes: 0
        };

        // Fetch candidates count for all elections
        let totalCandidates = 0;
        let totalVotes = 0;

        for (const election of elections) {
          try {
            const candidatesResponse = await fetch(`/api/admin/candidates?electionId=${election._id}`);
            const candidatesResult = await candidatesResponse.json();
            
            if (candidatesResult.success) {
              totalCandidates += candidatesResult.data.length;
              
              // Sum up vote counts
              const electionVotes = candidatesResult.data.reduce(
                (sum: number, candidate: any) => sum + (candidate.voteCount || 0), 
                0
              );
              totalVotes += electionVotes;
            }
          } catch (err) {
            console.error(`Error fetching candidates for election ${election._id}:`, err);
          }
        }

        newStats.totalCandidates = totalCandidates;
        newStats.totalVotes = totalVotes;
        setStats(newStats);
      } else {
        setError(electionsResult.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (election: RecentElection) => {
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
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage elections, candidates, and monitor voting activity</p>
        </div>
        <Link href="/admin/elections/create" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Election
        </Link>
      </div>

      {error && (
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalElections}</p>
              <p className="text-gray-600">Total Elections</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeElections}</p>
              <p className="text-gray-600">Active Elections</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</p>
              <p className="text-gray-600">Total Candidates</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Vote className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVotes}</p>
              <p className="text-gray-600">Total Votes Cast</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Election Status</h3>
            <TrendingUp className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{stats.activeElections}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Upcoming</span>
              <span className="font-semibold text-yellow-600">{stats.upcomingElections}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-gray-600">{stats.completedElections}</span>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <Settings className="w-5 h-5 text-gray-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/admin/elections" className="btn-secondary text-sm justify-center">
              <Calendar className="w-4 h-4 mr-2" />
              Manage Elections
            </Link>
            <Link href="/admin/candidates" className="btn-secondary text-sm justify-center">
              <Users className="w-4 h-4 mr-2" />
              Manage Candidates
            </Link>
            <Link href="/admin/electors" className="btn-secondary text-sm justify-center">
              <Users className="w-4 h-4 mr-2" />
              Manage Electors
            </Link>
            <Link href="/admin/results" className="btn-secondary text-sm justify-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Results
            </Link>
            <Link href="/admin/add-candidate" className="btn-primary text-sm justify-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Candidate
            </Link>
            <Link href="/admin/elections/create" className="btn-primary text-sm justify-center">
              <Plus className="w-4 h-4 mr-2" />
              Create Election
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Elections */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Elections</h3>
          <Link href="/admin/elections" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </Link>
        </div>

        {recentElections.length > 0 ? (
          <div className="space-y-4">
            {recentElections.map((election) => (
              <div key={election._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{election.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Starts: {formatDate(election.startDate)}</span>
                    <span>Ends: {formatDate(election.endDate)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(election)}
                  <Link 
                    href={`/admin/results?electionId=${election._id}`}
                    className="btn-secondary text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Elections Yet</h4>
            <p className="text-gray-600 mb-4">Create your first election to get started.</p>
            <Link href="/admin/elections/create" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Election
            </Link>
          </div>
        )}
      </div>

      {/* System Health */}
      <div className="card bg-green-50 border border-green-200">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h4 className="font-semibold text-green-900">System Status: Operational</h4>
            <p className="text-green-700 text-sm">All voting systems are running normally. Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}