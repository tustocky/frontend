"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const MySwal = withReactContent(Swal);

export default function Configuracion() {
  const [userId, setUserId] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [provincia, setProvincia] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedBusinessName = localStorage.getItem("businessName");

    if (storedUserId && storedBusinessName) {
      setUserId(storedUserId);
      fetchUserData(storedUserId);
    }
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/usuarios/${userId}`
      );
      const { nombre, email, telefono, direccion, provincia } = response.data;
      setNombre(nombre);
      setEmail(email);
      setTelefono(telefono);
      setDireccion(direccion || ""); // si viene vacío que no rompa
      setProvincia(provincia || "");
    } catch (error) {
      console.error("Error al obtener los datos del usuario", error);
    }
  };

  const openAddCategoryModal = () => {
    MySwal.fire({
      title: "Agregar Categorías",
      html: `
        <input id="categoria1" class="swal2-input" placeholder="Categoría 1 (Ejemplo: Zapatos)">
        <input id="categoria2" class="swal2-input" placeholder="Categoría 2 (Ejemplo: Accesorios)">
        <input id="categoria3" class="swal2-input" placeholder="Categoría 3 (Ejemplo: Ropa)">
      `,
      showCancelButton: true,
      confirmButtonText: "Agregar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const categoria1 = (
          document.getElementById("categoria1") as HTMLInputElement
        ).value.trim();
        const categoria2 = (
          document.getElementById("categoria2") as HTMLInputElement
        ).value.trim();
        const categoria3 = (
          document.getElementById("categoria3") as HTMLInputElement
        ).value.trim();

        const categorias = [categoria1, categoria2, categoria3].filter(
          (c) => c !== ""
        );

        if (categorias.length === 0) {
          Swal.showValidationMessage("Debes ingresar al menos una categoría.");
          return false;
        }

        try {
          for (const categoria of categorias) {
            await axios.post("http://localhost:5000/api/categorias", {
              categoria,
              usuarioId: userId,
            });
          }
          Swal.fire(
            "Categorías Agregadas",
            "Las categorías se han agregado correctamente.",
            "success"
          );
          return true;
        } catch (error) {
          Swal.showValidationMessage("Error al agregar las categorías.");
          return false;
        }
      },
    });
  };

  const openNotificationsModal = () => {
    MySwal.fire({
      title: "Activar Notificaciones",
      text: "Esta funcionalidad está en desarrollo.",
      icon: "info",
      confirmButtonText: "Aceptar",
    });
  };

  const openEditProfileModal = () => {
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

    // 👇 Asegurate de que esto venga del estado global o del componente
    const currentProvincia = provincia || ""; // <- Usá la provincia actual del usuario

    const provinciasOptions = provincias
      .map(
        (prov) =>
          `<option value="${prov}" ${
            prov === currentProvincia ? "selected" : ""
          }>${prov}</option>`
      )
      .join("");

    MySwal.fire({
      title: "Editar Perfil",
      html: `
        <input id="nombre" class="swal2-input" value="${nombre}" placeholder="Nombre del Negocio">
        <input id="email" class="swal2-input" value="${email}" placeholder="Correo Electrónico">
        <input id="telefono" class="swal2-input" value="${telefono}" placeholder="Número de Teléfono">
        <input id="direccion" class="swal2-input" value="${direccion}" placeholder="Dirección">
        <select id="provincia" class="swal2-input">
          <option value="">Seleccionar provincia</option>
          ${provinciasOptions}
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar Cambios",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const newNombre = (
          document.getElementById("nombre") as HTMLInputElement
        ).value;
        const newEmail = (document.getElementById("email") as HTMLInputElement)
          .value;
        const newTelefono = (
          document.getElementById("telefono") as HTMLInputElement
        ).value;
        const newDireccion = (
          document.getElementById("direccion") as HTMLInputElement
        ).value;
        const newProvincia = (
          document.getElementById("provincia") as HTMLSelectElement
        ).value;

        if (!newNombre || !newEmail || !newTelefono) {
          Swal.showValidationMessage(
            "Nombre, email y teléfono son obligatorios"
          );
          return false;
        }

        try {
          await axios.put(`http://localhost:5000/api/usuarios/${userId}`, {
            nombre: newNombre,
            email: newEmail,
            telefono: newTelefono,
            direccion: newDireccion,
            provincia: newProvincia,
          });

          localStorage.setItem("businessName", newNombre);
          setNombre(newNombre);
          setEmail(newEmail);
          setTelefono(newTelefono);
          setDireccion(newDireccion);
          setProvincia(newProvincia);

          Swal.fire(
            "Perfil Actualizado",
            "Los datos se han actualizado correctamente.",
            "success"
          );
          return true;
        } catch (error) {
          Swal.showValidationMessage("Error al actualizar el perfil");
          return false;
        }
      },
    });
  };

  return (
    <div className="container">
      <button
        className="btn btn-secondary volver-btn"
        onClick={() => (window.location.href = "/")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <div className="index-texts">
        <h1>Configuración</h1>
        <p>
          Desde acá podés gestionar tu perfil y configuración de la aplicación.
        </p>
      </div>
      <div className="config-buttons">
        <button className="btn" onClick={openAddCategoryModal}>
          Agregar Categoría
        </button>
        <button className="btn" onClick={openNotificationsModal}>
          Activar Notificaciones
        </button>
        <button className="btn" onClick={openEditProfileModal}>
          Editar mi Perfil
        </button>
      </div>
    </div>
  );
}
