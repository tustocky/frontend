"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faCheck,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el filtro de búsqueda
  const [filteredTickets, setFilteredTickets] = useState([]); // Estado para los tickets filtrados

  useEffect(() => {
    const storedUserId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    setUserId(storedUserId);

    if (storedUserId) {
      fetchTickets();
    }
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tickets");
      setTickets(response.data);
      setFilteredTickets(response.data); // Inicialmente, todos los tickets se muestran
    } catch (error) {
      console.error("Error al obtener tickets", error);
    }
  };

  const markAsCompleted = async (ticketId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`);
      Swal.fire(
        "Completado",
        "El ticket ha sido marcado como completado.",
        "success"
      );
      fetchTickets();
    } catch (error) {
      console.error("Error al actualizar el ticket", error);
    }
  };

  const showDescription = (description: string) => {
    Swal.fire({
      text: description,
      icon: "info",
      confirmButtonText: "Cerrar",
    });
  };

  // Función para manejar la búsqueda
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = tickets.filter(
      (ticket: any) =>
        ticket.description.toLowerCase().includes(value) ||
        ticket.userId?.nombre.toLowerCase().includes(value)
    );

    setFilteredTickets(filtered);
  };

  return (
    <div className="container">
      <button
        className="btn btn-secondary volver-btn"
        onClick={() => (window.location.href = "/")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <div className="admin-texts">
        <h1>Tickets de Soporte</h1>
        <p>
          Desde acá podés ver los tickets cargados por los usuarios y marcarlos
          como completados.
        </p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por descripción o nombre de usuario..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="table-container">
        {/* La tabla siempre se muestra, pero si no hay datos, mostramos un row con el mensaje */}
        <table className="table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  Todavía no hay información en la tabla.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket: any) => {
                return (
                  <tr key={ticket._id}>
                    <td>
                      <button
                        className="info-btn"
                        onClick={() => showDescription(ticket.description)}
                      >
                        <FontAwesomeIcon icon={faFile} />
                      </button>
                    </td>
                    <td>{ticket.userId?.nombre || "Usuario Desconocido"}</td>
                    <td>{ticket.fecha}</td>
                    <td>{ticket.hora}</td>
                    <td>{ticket.completed ? "Completado" : "Abierto"}</td>
                    <td>
                      {!ticket.completed && (
                        <button
                          className="success-btn"
                          onClick={() => markAsCompleted(ticket._id)}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
