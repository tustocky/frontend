"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPen,
  faPlus,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const MySwal = withReactContent(Swal);

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");
    if (userIdFromStorage) {
      setUserId(userIdFromStorage);
      fetchEmpleados(userIdFromStorage);
    }
  }, []);

  const fetchEmpleados = async (userId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/empleados/${userId}`
      );
      setEmpleados(response.data);
      setFilteredEmpleados(response.data);
    } catch (error) {
      console.error("Error al obtener empleados", error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = empleados.filter(
      (empleado: any) =>
        empleado.nombre.toLowerCase().includes(searchValue) ||
        empleado.dni.toString().includes(searchValue)
    );

    setFilteredEmpleados(filtered);
  };

  const openAddEmployeeModal = () => {
    MySwal.fire({
      title: "Agregar Empleado/a",
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre del Empleado">
        <input id="dni" type="number" class="swal2-input" placeholder="DNI">
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const nombre = (document.getElementById("nombre") as HTMLInputElement)
          .value;
        const dni = (document.getElementById("dni") as HTMLInputElement).value;

        if (!nombre || !dni) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }

        try {
          const response = await axios.post(
            "http://localhost:5000/api/empleados",
            {
              nombre,
              dni,
              usuarioId: userId,
            }
          );

          if (response.status === 201) {
            fetchEmpleados(userId);
            return true;
          }
        } catch (error) {
          Swal.showValidationMessage("Error al guardar empleado");
          return false;
        }
      },
    });
  };

  const openEditEmployeeModal = (empleado: any) => {
    MySwal.fire({
      title: "Editar Empleado/a",
      html: `
        <input id="nombre" class="swal2-input" value="${empleado.nombre}">
        <input id="dni" type="number" class="swal2-input" value="${empleado.dni}">
      `,
      showCancelButton: true,
      confirmButtonText: "Actualizar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const nombre = (document.getElementById("nombre") as HTMLInputElement)
          .value;
        const dni = (document.getElementById("dni") as HTMLInputElement).value;

        if (!nombre || !dni) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }

        try {
          const response = await axios.put(
            `http://localhost:5000/api/empleados/${empleado._id}`,
            {
              nombre,
              dni,
              usuarioId: userId,
            }
          );

          if (response.status === 200) {
            fetchEmpleados(userId);
            return true;
          }
        } catch (error) {
          Swal.showValidationMessage("Error al actualizar empleado");
          return false;
        }
      },
    });
  };

  const deleteEmployee = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/empleados/${id}`, {
        data: { usuarioId: userId },
      });
      fetchEmpleados(userId);
      Swal.fire("Eliminado", "Empleado eliminado correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar empleado", error);
    }
  };

  return (
    <div className="container">
      <button
        className="btn volver-btn"
        onClick={() => (window.location.href = "/")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <button className="btn agregar-btn" onClick={openAddEmployeeModal}>
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <div className="productos-texts">
        <h1>Mis Empleados</h1>
        <p>Desde acá podés agregar, editar o eliminar tus empleados.</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre o DNI..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmpleados.length > 0 ? (
              filteredEmpleados.map((empleado: any) => (
                <tr key={empleado._id}>
                  <td>{empleado.nombre}</td>
                  <td>{empleado.dni}</td>
                  <td className="acciones-td">
                    <button
                      className="editar-btn"
                      onClick={() => openEditEmployeeModal(empleado)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className="eliminar-btn"
                      onClick={() => deleteEmployee(empleado._id)}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="no-data">
                  Todavía no hay información en la tabla.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}