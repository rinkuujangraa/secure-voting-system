'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function CreateElectionPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Client-side validation
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const now = new Date();

    if (startDate <= now) {
      setError('Start date must be in the future');
      setIsLoading(false);
      return;
    }

    if (endDate <= startDate) {
      setError('End date must be after start date');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/elections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Election created successfully!');
        setTimeout(() => {
          router.push('/admin/elections');
        }, 2000);
      } else {
        setError(result.error || 'Failed to create election');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Get current datetime for min values
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 60000).toISOString().slice(0, 16); // 1 minute from now

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          href="/admin/elections" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Elections
        </Link>
      </div>

      <div className="text-center">
        <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Election</h1>
        <p className="text-gray-600">Set up a new election with candidates and voting parameters</p>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Election Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter election title (e.g., Student Council Election 2026)"
              required
              disabled={isLoading}
              minLength={3}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              A clear, descriptive title for the election
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-24 resize-vertical"
              placeholder="Provide a detailed description of the election purpose, rules, and any important information for voters..."
              required
              disabled={isLoading}
              minLength={10}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">
                Start Date & Time *
              </label>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                className="input"
                required
                disabled={isLoading}
                min={minDateTime}
              />
              <p className="text-xs text-gray-500 mt-1">
                When voting will begin
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="endDate" className="form-label">
                End Date & Time *
              </label>
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                className="input"
                required
                disabled={isLoading}
                min={formData.startDate || minDateTime}
              />
              <p className="text-xs text-gray-500 mt-1">
                When voting will end
              </p>
            </div>
          </div>

          {/* Preview */}
          {formData.title && formData.description && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Election Preview</h3>
              <div className="card bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-2">{formData.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{formData.description}</p>
                
                {formData.startDate && formData.endDate && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <strong>Starts:</strong> {new Date(formData.startDate).toLocaleString()}
                    </div>
                    <div>
                      <strong>Ends:</strong> {new Date(formData.endDate).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link 
              href="/admin/elections" 
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating Election...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Create Election
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Next Steps</h3>
        <div className="text-blue-800 text-sm space-y-2">
          <p>1. After creating the election, you&apos;ll be able to add candidates</p>
          <p>2. The election status will be &quot;Upcoming&quot; until the start date</p>
          <p>3. You can manually start/end elections or they will auto-transition based on dates</p>
          <p>4. Once started, candidates cannot be modified</p>
        </div>
      </div>
    </div>
  );
}