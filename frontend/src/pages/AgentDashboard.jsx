import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import StatCard from "../components/StatCard";

export default function AgentDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    pending: 0,
    resolved: 0,
    closed: 0,
  });

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-8">
        Agent Dashboard
      </h1>

      <div className="grid grid-cols-5 gap-5 mb-8">
        <StatCard
          title="Total"
          value={stats.total}
          color="bg-gray-700"
        />

        <StatCard
          title="Open"
          value={stats.open}
          color="bg-blue-600"
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          color="bg-yellow-500"
        />

        <StatCard
          title="Resolved"
          value={stats.resolved}
          color="bg-green-600"
        />

        <StatCard
          title="Closed"
          value={stats.closed}
          color="bg-red-600"
        />
      </div>

      <Link
        to="/tickets"
        className="bg-green-600 text-white px-6 py-3 rounded"
      >
        My Tickets
      </Link>
    </div>
  );
}