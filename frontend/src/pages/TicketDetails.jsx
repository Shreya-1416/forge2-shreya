import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function TicketDetails() {

    const { id } = useParams();

    const [ticket,setTicket]=useState(null);

    const [agents,setAgents]=useState([]);

    useEffect(()=>{

        loadTicket();

        api.get("/agents")
            .then(res=>setAgents(res.data));

    },[]);

    function loadTicket(){

        api.get(`/tickets/${id}`)
            .then(res=>setTicket(res.data));

    }

    function assign(agentId){

        api.put(`/tickets/${id}`,{
            agent_id:agentId
        }).then(loadTicket);

    }

    if(!ticket)
        return <h2>Loading...</h2>;

    return(

        <div className="p-10">

            <h1 className="text-3xl font-bold">

                {ticket.subject}

            </h1>

            <p className="mt-5">

                {ticket.description}

            </p>

            <div className="mt-8">

                <h3 className="font-bold mb-3">

                    Assign Agent

                </h3>

                <select

                    className="border p-2"

                    onChange={(e)=>assign(e.target.value)}

                    value={ticket.agent_id ?? ""}

                >

                    <option value="">Unassigned</option>

                    {

                        agents.map(agent=>(

                            <option

                                key={agent.id}

                                value={agent.id}

                            >

                                {agent.name}

                            </option>

                        ))

                    }

                </select>

            </div>

        </div>

    );

}