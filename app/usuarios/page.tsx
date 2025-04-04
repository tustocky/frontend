"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPen, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/usuarios");
      setUsuarios(response.data);
      setFilteredUsuarios(response.data); // Inicialmente muestra todos
    } catch (error) {
      console.error("Error al obtener usuarios", error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = usuarios.filter(
      (usuario: any) =>
        usuario.nombre.toLowerCase().includes(searchValue) ||
        (usuario.email || "").toLowerCase().includes(searchValue) ||
        (usuario.telefono || "").toLowerCase().includes(searchValue)
    );

    setFilteredUsuarios(filtered);
  };

  const handleEdit = async (usuario: any) => {
    const provincias = [
      "Buenos Aires",
      "Catamarca",
      "Chaco",
      "Chubut",
      "Córdoba",
      "Corrientes",
      "Entre Ríos",
      "Formosa",
      "Jujuy",
      "La Pampa",
      "La Rioja",
      "Mendoza",
      "Misiones",
      "Neuquén",
      "Río Negro",
      "Salta",
      "San Juan",
      "San Luis",
      "Santa Cruz",
      "Santa Fe",
      "Santiago del Estero",
      "Tierra del Fuego",
      "Tucumán",
      "CABA",
    ];

    const provinciasOptions = provincias
      .map(
        (prov) =>
          `<option value="${prov}" ${
            prov === usuario.provincia ? "selected" : ""
          }>${prov}</option>`
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      title: "Editar Usuario",
      html: `<input id="nombre" class="swal2-input" value="${
        usuario.nombre
      }" placeholder="Nombre del Negocio">
         <input id="email" class="swal2-input" value="${
           usuario.email
         }" placeholder="Email">
         <input id="telefono" class="swal2-input" value="${
           usuario.telefono
         }" placeholder="Teléfono">
         <input id="direccion" class="swal2-input" value="${
           usuario.direccion || ""
         }" placeholder="Dirección">
         <select id="provincia" class="swal2-input">
           <option value="">Seleccionar provincia</option>
           ${provinciasOptions}
         </select>
         <select id="esAdmin" class="swal2-input">
           <option value="true" ${
             usuario.esAdmin ? "selected" : ""
           }>Sí (Admin)</option>
           <option value="false" ${
             !usuario.esAdmin ? "selected" : ""
           }>No (Usuario)</option>
         </select>
         <select id="inhabilitado" class="swal2-input">
           <option value="false" ${
             !usuario.inhabilitado ? "selected" : ""
           }>Habilitado</option>
           <option value="true" ${
             usuario.inhabilitado ? "selected" : ""
           }>Inhabilitado</option>
         </select>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          nombre: (document.getElementById("nombre") as HTMLInputElement).value,
          email: (document.getElementById("email") as HTMLInputElement).value,
          telefono: (document.getElementById("telefono") as HTMLInputElement)
            .value,
          direccion: (document.getElementById("direccion") as HTMLInputElement)
            .value,
          provincia: (document.getElementById("provincia") as HTMLSelectElement)
            .value,
          esAdmin:
            (document.getElementById("esAdmin") as HTMLSelectElement).value ===
            "true",
          inhabilitado:
            (document.getElementById("inhabilitado") as HTMLSelectElement)
              .value === "true",
        };
      },
    });

    if (formValues) {
      try {
        await axios.put(
          `http://localhost:5000/api/usuarios/${usuario._id}`,
          formValues
        );
        fetchUsuarios();
        Swal.fire(
          "Actualizado",
          "Usuario actualizado correctamente",
          "success"
        );
      } catch (error) {
        Swal.fire("Error", "No se pudo actualizar el usuario", "error");
      }
    }
  };

  const handleInhabilitar = async (userId: string, inhabilitar: boolean) => {
    try {
      const result = await Swal.fire({
        title: `¿Estás seguro de ${
          inhabilitar ? "inhabilitar" : "habilitar"
        } este usuario?`,
        text: `Esta acción ${
          inhabilitar ? "inhabilitará" : "habilitará"
        } al usuario.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: inhabilitar ? "Inhabilitar" : "Habilitar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        await axios.put(`http://localhost:5000/api/usuarios/${userId}`, {
          inhabilitado: inhabilitar,
        });
        Swal.fire(
          inhabilitar ? "Inhabilitado" : "Habilitado",
          `El usuario ha sido ${
            inhabilitar ? "inhabilitado" : "habilitado"
          } correctamente.`,
          "success"
        );
        fetchUsuarios();
      }
    } catch (error) {
      console.error("Error al cambiar el estado del usuario", error);
    }
  };

  return (
    <div className="container">
      {/* Botón Volver */}
      <button
        className="btn btn-secondary volver-btn"
        onClick={() => (window.location.href = "/")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <div className="admin-texts">
        <h1>Usuarios Registrados</h1>
        <p>
          Desde acá podés ver la lista completa de usuarios registrados en la
          aplicación.
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Admin</th>
              <th>Inhabilitado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.length > 0 ? (
              filteredUsuarios.map((usuario: any) => (
                <tr key={usuario._id}>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.email || "No registrado"}</td>
                  <td>{usuario.telefono || "No registrado"}</td>
                  <td>{usuario.esAdmin ? "Sí" : "No"}</td>
                  <td>{usuario.inhabilitado ? "Sí" : "No"}</td>
                  <td>
                    <button
                      className="editar-btn"
                      onClick={() => handleEdit(usuario)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className="eliminar-btn"
                      onClick={() =>
                        handleInhabilitar(usuario._id, !usuario.inhabilitado)
                      }
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="no-data">
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
