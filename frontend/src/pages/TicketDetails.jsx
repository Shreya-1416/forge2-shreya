import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadTicket();
  }, []);

  async function loadTicket() {
    const res = await api.get(`/tickets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setTicket(res.data);
  }

  async function sendReply() {
    await api.post(
      `/tickets/${id}/reply`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessage("");
    loadTicket();
  }

  if (!ticket) return <h2>Loading...</h2>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{ticket.subject}</h1>

      <p className="mt-4">{ticket.description}</p>

      <h2 className="text-xl mt-8 mb-3">Conversation</h2>

      {ticket.messages.map((msg) => (
        <div key={msg.id} className="border p-3 mb-2 rounded">
          {msg.message}
        </div>
      ))}

      <textarea
        className="border w-full p-2 mt-4"
        rows="4"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={sendReply}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
      >
        Reply
      </button>
    </div>
  );
}