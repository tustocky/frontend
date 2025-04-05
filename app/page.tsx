"use client";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faQuestion,
  faGear,
  faBell,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MySwal = withReactContent(Swal);

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedBusinessName = localStorage.getItem("businessName");
    const storedEsAdmin = localStorage.getItem("esAdmin");

    if (storedUserId && storedBusinessName) {
      setIsAuthenticated(true);
      setBusinessName(storedBusinessName);
      setIsAdmin(storedEsAdmin === "true");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("businessName");
    localStorage.removeItem("esAdmin");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  const openRegisterModal = () => {
    MySwal.fire({
      title: "Registrarse",
      html: `
        <input id="business-name" class="swal2-input" placeholder="Nombre del Negocio">
        <input id="business-email" class="swal2-input" placeholder="Correo Electrónico">
        <input id="business-phone" class="swal2-input" placeholder="Número de Teléfono">
        <input id="business-password" type="password" class="swal2-input" placeholder="Contraseña">
        <input id="business-confirm-password" type="password" class="swal2-input" placeholder="Confirmar Contraseña">
      `,
      showCancelButton: true,
      confirmButtonText: "Registrar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const nombre = (
          document.getElementById("business-name") as HTMLInputElement
        ).value;
        const email = (
          document.getElementById("business-email") as HTMLInputElement
        ).value;
        const telefono = (
          document.getElementById("business-phone") as HTMLInputElement
        ).value;
        const contraseña = (
          document.getElementById("business-password") as HTMLInputElement
        ).value;
        const confirmPassword = (
          document.getElementById(
            "business-confirm-password"
          ) as HTMLInputElement
        ).value;

        if (!nombre || !email || !telefono || !contraseña || !confirmPassword) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }

        if (contraseña !== confirmPassword) {
          Swal.showValidationMessage("Las contraseñas no coinciden");
          return false;
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/register`,
            {
              nombre,
              email,
              telefono,
              contraseña,
            }
          );

          if (response.status === 201) {
            localStorage.setItem("userId", response.data.userId);
            localStorage.setItem("businessName", nombre);
            localStorage.setItem("esAdmin", "false");
            setIsAuthenticated(true);
            setBusinessName(nombre);
            setIsAdmin(false);
            return true;
          }
        } catch (error) {
          Swal.showValidationMessage(
            "Error al registrar. Inténtelo nuevamente."
          );
          return false;
        }
      },
    });
  };

  const openLoginModal = () => {
    MySwal.fire({
      title: "Iniciar Sesión",
      html: `
        <input id="login-name" class="swal2-input" placeholder="Nombre del Negocio o Email">
        <input id="login-password" type="password" class="swal2-input" placeholder="Contraseña">
      `,
      showCancelButton: true,
      confirmButtonText: "Iniciar Sesión",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const nombre = (
          document.getElementById("login-name") as HTMLInputElement
        ).value;
        const contraseña = (
          document.getElementById("login-password") as HTMLInputElement
        ).value;

        if (!nombre || !contraseña) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/login`,
            { nombre, contraseña }
          );
          if (response.status === 200) {
            const { nombre: businessName, userId, esAdmin } = response.data;
            localStorage.setItem("userId", userId);
            localStorage.setItem("businessName", businessName);
            localStorage.setItem("esAdmin", esAdmin.toString());
            setIsAuthenticated(true);
            setBusinessName(businessName);
            setIsAdmin(esAdmin);
            return true;
          }
        } catch (error) {
          Swal.showValidationMessage(
            "Error al iniciar sesión. Inténtelo nuevamente."
          );
          return false;
        }
      },
    });
  };

  const openHelpModal = () => {
    MySwal.fire({
      title: "¿Necesitás ayuda?",
      html: `
        <p>Contanos qué problema estás teniendo y el equipo técnico te va a responder lo antes posible:</p>
        <textarea id="ticket-description" class="swal2-textarea" placeholder="Escribí tu consulta acá..." style="resize: none;"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Enviar mensaje",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const description = (
          document.getElementById("ticket-description") as HTMLTextAreaElement
        ).value;
        const userId = localStorage.getItem("userId");

        if (!description.trim()) {
          Swal.showValidationMessage(
            "Por favor, escribí una descripción del problema."
          );
          return false;
        }

        try {
          const response = await axios.post(
            "http://localhost:5000/api/tickets",
            { description, userId }
          );

          if (response.status === 201) {
            Swal.fire(
              "Mensaje enviado",
              "Tu consulta fue enviada correctamente. Nos contactaremos a la brevedad.",
              "success"
            );
            return true;
          }
        } catch (error) {
          Swal.fire(
            "Ups, algo salió mal",
            "No pudimos enviar tu mensaje. Intentá nuevamente en unos minutos.",
            "error"
          );
          return false;
        }
      },
    });
  };

  const openCalendarModal = () => {
    Swal.fire({
      title: "Informe de Caja por Fecha",
      html: `
        <p>Seleccioná una fecha para consultar las ventas y generar el Informe correspondiente.</p>
        <p class="aclaracion">Importante: solo podés consultar informes de hasta un mes atrás.</p>
        <input type="date" id="selectedDate" class="swal2-input" style="max-width: 200px;" />
      `,
      confirmButtonText: "Consultar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      preConfirm: async () => {
        const selectedDate = document.getElementById("selectedDate").value;

        if (!selectedDate) {
          Swal.showValidationMessage("Por favor, seleccioná una fecha.");
          return false;
        }

        try {
          const userId = localStorage.getItem("userId");
          const response = await axios.get(
            `http://localhost:5000/api/ventas/ventas?userId=${userId}&fecha=${selectedDate}`
          );

          const ventas = response.data;
          if (!Array.isArray(ventas) || ventas.length === 0) {
            Swal.showValidationMessage(
              "No se registraron ventas en la fecha seleccionada."
            );
            return false;
          }

          return { ventas, selectedDate };
        } catch (error) {
          Swal.showValidationMessage(
            "Ocurrió un error al consultar las ventas. Por favor, intentá nuevamente."
          );
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { ventas, selectedDate } = result.value;
        const [year, month, day] = selectedDate.split("-");
        const fechaArg = `${day}/${month}/${year}`;

        Swal.fire({
          title: `Ventas del ${fechaArg}`,
          html: `
            <p>Se registraron <strong>${ventas.length}</strong> ventas.</p>
            <p>¿Querés descargar el Informe en PDF?</p>
          `,
          confirmButtonText: "Descargar Informe",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
        }).then((downloadResult) => {
          if (downloadResult.isConfirmed) {
            const doc = new jsPDF();

            doc.setFontSize(14);
            doc.text(`Informe de Caja`, 10, 10);
            doc.setFontSize(12);
            doc.text(`Fecha: ${fechaArg}`, 10, 20);

            let efectivoTotal = 0;
            let debitoTotal = 0;
            ventas.forEach((venta) => {
              if (venta.medioPago === "Efectivo") {
                efectivoTotal += venta.totalVenta || 0;
              } else if (venta.medioPago === "Debito/Credito") {
                debitoTotal += venta.totalVenta || 0;
              }
            });

            doc.text(`Efectivo: $${efectivoTotal.toFixed(2)}`, 10, 30);
            doc.text(`Débito / Crédito: $${debitoTotal.toFixed(2)}`, 10, 37);

            const tableBody = ventas.map((venta) => [
              venta.fecha,
              venta.hora,
              venta.empleadoId?.nombre || "Sin Vendedor",
              venta.medioPago,
              `$${venta.totalVenta?.toFixed(2) || 0}`,
            ]);

            autoTable(doc, {
              startY: 45,
              head: [["Fecha", "Hora", "Vendedor", "Medio de Pago", "Total"]],
              body: tableBody,
              theme: "grid",
              headStyles: {
                fillColor: [2, 81, 89],
                textColor: [255, 255, 255],
              },
              footStyles: {
                fillColor: [2, 81, 89],
                textColor: [255, 255, 255],
              },
            });

            const nombreArchivo = fechaArg.replace(/-/g, "_");
            doc.save(`caja_${nombreArchivo}.pdf`);
          }
        });
      }
    });
  };

  const handleAlertSettings = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Activar alertas por WhatsApp",
      html: `
        <p>
          Recibí notificaciones directamente en tu WhatsApp para mantenerte al tanto de tu negocio.
        </p>
  
        <div class="switch-container">
          <label class="switch">
            <input type="checkbox" id="alertaCaja">
            <span class="slider"></span>
          </label>
          <p>Alerta Informe de Caja del Día</p>
        </div>
  
        <div class="switch-container">
          <label class="switch">
            <input type="checkbox" id="alertaStock">
            <span class="slider"></span>
          </label>
          <p>Alerta Estado de Stock</p>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: "Guardar",
      preConfirm: () => {
        return {
          alertaCaja: document.getElementById("alertaCaja").checked,
          alertaStockBajo: document.getElementById("alertaStock").checked,
        };
      },
    });

    if (formValues) {
      try {
        const userId = localStorage.getItem("userId"); // 🔑 ahora sí se usa
        await axios.put(`/api/usuarios/alertas/${userId}`, formValues);
        Swal.fire(
          "Guardado",
          "Las preferencias fueron actualizadas.",
          "success"
        );
      } catch (error) {
        Swal.fire("Error", "No se pudo guardar la configuración.", "error");
      }
    }
  };

  if (isAuthenticated) {
    if (isAdmin) {
      return (
        <div className="container">
          <div className="index-header">
            <button className="logout-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          </div>
          <div className="index-texts">
            <h1>
              Bienvenido a <span className="logo">Stocky</span>, {businessName}
            </h1>
            <p>Panel de Administración</p>
          </div>
          <div className="admin-buttons">
            <button
              className="btn"
              onClick={() => (window.location.href = "/tickets")}
            >
              Tickets
            </button>
            <button
              className="btn"
              onClick={() => (window.location.href = "/usuarios")}
            >
              Usuarios
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="container">
          <button className="btn help-btn" onClick={openHelpModal}>
            <FontAwesomeIcon icon={faQuestion} />
          </button>
          <button
            className="btn config-btn"
            onClick={() => (window.location.href = "/configuracion")}
          >
            <FontAwesomeIcon icon={faGear} />
          </button>
          <button className="btn alert-btn" onClick={handleAlertSettings}>
            <FontAwesomeIcon icon={faBell} />
          </button>
          <button className="btn calendar-btn" onClick={openCalendarModal}>
            <FontAwesomeIcon icon={faCalendarDays} />
          </button>
          <div className="index-header">
            <button className="logout-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          </div>
          <div className="index-texts">
            <h1>
              Bienvenido a <span className="logo">Stocky</span>, {businessName}
            </h1>
            <p>Tu negocio más simple.</p>
          </div>
          <div className="index-buttons">
            <button
              className="btn"
              onClick={() => (window.location.href = "/productos")}
            >
              Mis Productos
            </button>
            <button
              className="btn"
              onClick={() => (window.location.href = "/empleados")}
            >
              Empleados/as
            </button>
            <button
              className="btn"
              onClick={() => (window.location.href = "/stock")}
            >
              Stock
            </button>
            <button
              className="btn"
              onClick={() => (window.location.href = "/cajadeldia")}
            >
              Caja del Día
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="container">
      <div className="login-texts">
        <h1>
          Bienvenido a <span className="logo">Stocky</span>
        </h1>
        <p>Tu negocio más simple.</p>
      </div>
      <div className="login-buttons">
        <button className="registrarse-btn" onClick={openRegisterModal}>
          Registrarse
        </button>
        <button className="login-btn" onClick={openLoginModal}>
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}
