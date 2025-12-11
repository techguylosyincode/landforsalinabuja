export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Listings</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Agents</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <p className="text-gray-500">No recent activity.</p>
            </div>
        </div>
    );
}
