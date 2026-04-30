'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Vote, Calendar, CheckCircle, Clock, BarChart3, Users } from 'lucide-react';

interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  isActive: boolean;
}

export default function UserDashboard() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchElections();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeElections = elections.filter(e => e.isActive);
  const upcomingElections = elections.filter(e => e.status === 'upcoming');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voter Dashboard</h1>
        <p className="text-gray-600">Participate in secure democratic elections</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeElections.length}</p>
              <p className="text-gray-600">Active Elections</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingElections.length}</p>
              <p className="text-gray-600">Upcoming Elections</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{elections.length}</p>
              <p className="text-gray-600">Total Elections</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Active Elections */}
      {activeElections.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Vote className="w-6 h-6 mr-2 text-green-600" />
            Active Elections - Vote Now!
          </h2>
          <div className="grid gap-6">
            {activeElections.map((election) => (
              <div key={election._id} className="card border-l-4 border-l-green-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{election.title}</h3>
                    <p className="text-gray-600 mb-3">{election.description}</p>
                  </div>
                  {getStatusBadge(election)}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Ends: {formatDate(election.endDate)}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Link 
                    href={`/user/vote/${election._id}`}
                    className="btn-primary"
                  >
                    <Vote className="w-4 h-4 mr-2" />
                    Cast Vote
                  </Link>
                  <Link 
                    href={`/user/results?electionId=${election._id}`}
                    className="btn-secondary"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Elections */}
      {upcomingElections.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-yellow-600" />
            Upcoming Elections
          </h2>
          <div className="grid gap-4">
            {upcomingElections.map((election) => (
              <div key={election._id} className="card border-l-4 border-l-yellow-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{election.title}</h3>
                    <p className="text-gray-600 mb-2">{election.description}</p>
                  </div>
                  {getStatusBadge(election)}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Starts: {formatDate(election.startDate)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* No Elections */}
      {elections.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Elections Available</h3>
          <p className="text-gray-600">There are currently no elections to participate in.</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card bg-primary-50 border border-primary-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/user/elections" className="btn-primary">
              View All Elections
            </Link>
            <Link href="/user/results" className="btn-secondary">
              View Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}