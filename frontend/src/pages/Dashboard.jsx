import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">PulseDesk Dashboard</h1>

      <Link
        to="/tickets"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        View Tickets
      </Link>
    </div>
  );
}