import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function CreateTicket() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });

  const submit = async () => {
    try {
      const res = await api.post("/tickets", form);

      console.log(res.data);

      alert("Ticket Created Successfully");

      navigate("/tickets");
    } catch (err) {
      console.error(err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Response:", err.response.data);
      }

      alert("Failed to create ticket");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">
        Create Ticket
      </h1>

      <input
        type="text"
        placeholder="Subject"
        value={form.subject}
        onChange={(e) =>
          setForm({
            ...form,
            subject: e.target.value,
          })
        }
        className="border w-full p-3 rounded mb-4"
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({
            ...form,
            description: e.target.value,
          })
        }
        className="border w-full p-3 rounded mb-4"
        rows={6}
      />

      <select
        className="border w-full p-3 rounded mb-6"
        value={form.priority}
        onChange={(e) =>
          setForm({
            ...form,
            priority: e.target.value,
          })
        }
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button
        onClick={submit}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
      >
        Create Ticket
      </button>
    </div>
  );
}