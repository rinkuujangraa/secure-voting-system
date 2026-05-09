'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Election {
  _id: string;
  title: string;
  status: string;
}

export default function AddCandidatePage() {
  const router = useRouter();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    party: '',
    electionId: ''
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await fetch('/api/admin/elections');
      const result = await response.json();

      if (result.success) {
        // Filter only upcoming elections
        const upcomingElections = result.data.filter((e: Election) => e.status === 'upcoming');
        setElections(upcomingElections);
      }
    } catch (err) {
      setError('Failed to load elections');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Candidate added successfully!');
        setFormData({ name: '', party: '', electionId: '' });

        // Redirect to candidates page after 1.5 seconds
        setTimeout(() => {
          router.push('/admin/candidates');
        }, 1500);
      } else {
        setError(result.error || 'Failed to add candidate');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/candidates" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Candidates
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Candidate</h1>
        <p className="text-gray-600">Add a candidate to an upcoming election</p>
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

      {/* No Elections Warning */}
      {elections.length === 0 && !error && (
        <div className="card bg-yellow-50 border border-yellow-200">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-yellow-800 font-semibold">No upcoming elections available</p>
              <p className="text-yellow-700 text-sm">Candidates can only be added to upcoming elections. Please create an election first.</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Election Selection */}
          <div className="form-group">
            <label htmlFor="election" className="form-label">
              Select Election *
            </label>
            <select
              id="election"
              value={formData.electionId}
              onChange={(e) => setFormData(prev => ({ ...prev, electionId: e.target.value }))}
              className="input"
              required
              disabled={loading || elections.length === 0}
            >
              <option value="">Choose an election</option>
              {elections.map((election) => (
                <option key={election._id} value={election._id}>
                  {election.title}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Only upcoming elections are shown</p>
          </div>

          {/* Candidate Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Candidate Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="Enter candidate full name"
              required
              minLength={2}
              maxLength={50}
              disabled={loading}
            />
          </div>

          {/* Party/Affiliation */}
          <div className="form-group">
            <label htmlFor="party" className="form-label">
              Party or Affiliation *
            </label>
            <input
              id="party"
              type="text"
              value={formData.party}
              onChange={(e) => setFormData(prev => ({ ...prev, party: e.target.value }))}
              className="input"
              placeholder="Enter party name or affiliation"
              required
              minLength={2}
              maxLength={50}
              disabled={loading}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <Link href="/admin/candidates" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || elections.length === 0}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Adding...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Important Notes</h3>
        <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
          <li>Candidates can only be added to upcoming elections</li>
          <li>Once an election starts, you cannot add or remove candidates</li>
          <li>Candidate names must be unique within each election</li>
          <li>All fields are required</li>
        </ul>
      </div>
    </div>
  );
}
