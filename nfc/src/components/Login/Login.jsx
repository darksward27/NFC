import React, { useState, useEffect } from 'react';

function Login({ onLogin }) {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch organizations when component mounts
    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/organizations');
            if (!response.ok) {
                throw new Error('Failed to fetch organizations');
            }
            const data = await response.json();
            setOrganizations(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching organizations:', error);
            setError('Failed to load organizations. Please try again.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedOrg) {
            setError('Please select an organization');
            return;
        }

        // Find the selected organization object
        const organization = organizations.find(org => org._id === selectedOrg);
        
        onLogin({
            organizationId: selectedOrg,
            organizationName: organization.name,
            token: 'dummy_token'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        University Dashboard
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Select your organization to continue
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm">
                        <div className="mb-4">
                            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                                Organization
                            </label>
                            <select
                                id="organization"
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                required
                            >
                                <option value="">Select Organization</option>
                                {organizations.map((org) => (
                                    <option key={org._id} value={org._id}>
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Continue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login; 