import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function loadTickets() {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get("/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTickets(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    loadTickets();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
  <h1 className="text-3xl font-bold">Tickets</h1>

  <Link
    to="/tickets/create"
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    New Ticket
  </Link>
</div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Subject</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Priority</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="border p-2">{ticket.id}</td>
              <td className="border p-2">
  <Link
    className="text-blue-600"
    to={`/tickets/${ticket.id}`}
  >
    {ticket.subject}
  </Link>
</td>
              <td className="border p-2">{ticket.status}</td>
              <td className="border p-2">{ticket.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}