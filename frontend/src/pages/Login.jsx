import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";


export default function Login() {
    const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await api.post("/login", {
        email,
        password,
      });
      console.log(res.data);

localStorage.setItem("token", res.data.token);

console.log(localStorage.getItem("token"));

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");
    } catch {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="w-96 p-6 shadow rounded">
        <h1 className="text-2xl font-bold mb-4">PulseDesk Login</h1>

        <input
          className="border w-full p-2 mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border w-full p-2 mb-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}