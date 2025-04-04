"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faArrowLeft,
  faXmark,
  faBoxesPacking,
} from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ReactDOMServer from "react-dom/server";

const MySwal = withReactContent(Swal);

export default function CajaDelDia() {
  const [ventas, setVentas] = useState([]);
  const [filteredVentas, setFilteredVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [userId, setUserId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dayStarted, setDayStarted] = useState(false);

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");
    const storedBusinessName = localStorage.getItem("businessName");

    if (userIdFromStorage) {
      // Guardamos cada uno en su estado correspondiente
      setUserId(userIdFromStorage);
      if (storedBusinessName) {
        setBusinessName(storedBusinessName);
      }
      // Si el día está iniciado, traemos las ventas
      if (localStorage.getItem("dayStarted") === "true") {
        fetchVentas(userIdFromStorage);
      } else {
        setVentas([]);
        setFilteredVentas([]);
      }
      // Independientemente, traemos productos y empleados
      fetchProductos(userIdFromStorage);
      fetchEmpleados(userIdFromStorage);
    }

    // Recuperamos el estado del día del localStorage
    if (localStorage.getItem("dayStarted") === "true") {
      setDayStarted(true);
    }
  }, []);

  const fetchVentas = async (userId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/ventas/ventas?userId=${userId}`
      );

      const ventas = response.data;
      setVentas(ventas);
      setFilteredVentas(ventas);
    } catch (error) {
      console.error("Error al obtener ventas", error);
    }
  };

  const fetchProductos = async (userId: string) => {
    if (!userId) {
      console.error("El userId es inválido o está vacío.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/productos/productos-con-stock/${userId}`
      );
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos con stock disponible:", error);
    }
  };

  const fetchEmpleados = async (userId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/empleados/${userId}`
      );
      setEmpleados(response.data);
    } catch (error) {
      console.error("Error al obtener empleados", error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = ventas.filter((venta: any) => {
      const fechaStr = new Date(venta.fecha).toLocaleDateString();
      const horaStr = new Date(venta.hora).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        venta.empleadoId?.nombre.toLowerCase().includes(searchValue) ||
        venta.medioPago.toLowerCase().includes(searchValue) ||
        fechaStr.includes(searchValue) ||
        horaStr.includes(searchValue) ||
        venta.totalVenta.toString().includes(searchValue)
      );
    });

    setFilteredVentas(filtered);
  };

  // Función para abrir el modal de agregar venta
  const openAddVentaModal = () => {
    // Si el día no ha comenzado, mostramos un mensaje y no se abre el modal
    if (!dayStarted) {
      Swal.fire({
        title: "El día no ha comenzado",
        text: "Debes comenzar el día antes de registrar ventas.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const now = new Date();
    const fecha = now.toISOString().split("T")[0];
    const hora = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Array de productos seleccionados
    const productosSeleccionados: {
      productoId: string;
      nombre: string;
      cantidad: number;
      total: number;
    }[] = [];

    // Función para mostrar el modal con los productos agregados
    const showProductsSwal = () => {
      const iconHTML = ReactDOMServer.renderToString(
        <FontAwesomeIcon icon={faXmark} />
      );
      const productosHTML = productosSeleccionados
        .map(
          (prod, index) => `
          <tr>
            <td>${prod.nombre}</td>
            <td>${prod.cantidad}</td>
            <td>${prod.total.toFixed(2)}</td>
            <td>
              <button 
                class="eliminarProductoBtn" 
                data-index="${index}" 
                style="color: red;"
              >
                ${iconHTML}
              </button>
            </td>
          </tr>
        `
        )
        .join("");

      const total = productosSeleccionados.reduce(
        (acc, prod) => acc + prod.total,
        0
      );

      MySwal.fire({
        html: `
          <h2>Productos Agregados</h2>
          <table style="width: 100%; margin-bottom: 10px;">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              ${productosHTML}
            </tbody>
          </table>
          <h2>Total: $${total.toFixed(2)}</h2>
          <h3>Empleado/a</h3>
          <select id="empleadoId" class="swal2-input">
            ${empleados
              .map(
                (empleado: any) =>
                  `<option value="${empleado._id}">${empleado.nombre}</option>`
              )
              .join("")}
          </select>
          <h3>Medio de Pago</h3>
          <select id="medioPago" class="swal2-input">
            <option value="Efectivo">Efectivo</option>
            <option value="Debito/Credito">Débito / Crédito</option>
          </select>
        `,
        showCancelButton: true,
        confirmButtonText: "Registrar Venta",
        cancelButtonText: "Cancelar",
        willOpen: () => {
          document
            .querySelectorAll(".eliminarProductoBtn")
            .forEach((button) => {
              button.addEventListener("click", (e) => {
                const index = (e.target as HTMLElement).getAttribute(
                  "data-index"
                );
                if (index !== null) {
                  productosSeleccionados.splice(parseInt(index), 1);
                  showProductsSwal();
                }
              });
            });
        },
        preConfirm: async () => {
          if (productosSeleccionados.length === 0) {
            Swal.showValidationMessage("Debe agregar al menos un producto.");
            return false;
          }

          const medioPagoElement = document.getElementById(
            "medioPago"
          ) as HTMLSelectElement | null;
          const empleadoElement = document.getElementById(
            "empleadoId"
          ) as HTMLSelectElement | null;

          if (!medioPagoElement || !empleadoElement) {
            Swal.showValidationMessage(
              "Debe seleccionar un empleado y un medio de pago."
            );
            return false;
          }

          const medioPago = medioPagoElement.value;
          const empleadoId = empleadoElement.value;

          try {
            const response = await axios.post(
              "http://localhost:5000/api/ventas",
              {
                usuarioId: userId,
                productos: productosSeleccionados.map((prod) => ({
                  productoId: prod.productoId,
                  cantidad: prod.cantidad,
                  total: prod.total,
                })),
                // Quitamos "fecha" y "hora", pues las asigna el servidor
                empleadoId,
                medioPago,
              }
            );

            if (response.status === 201) {
              fetchVentas(userId);
              fetchProductos(userId);
              Swal.fire("Venta registrada correctamente", "", "success");
              return true;
            }
          } catch (error) {
            Swal.showValidationMessage("Error al registrar la venta.");
            return false;
          }
        },
      });
    };

    MySwal.fire({
      title: "Registrar Venta",
      html: `
        <input id="fecha" class="swal2-input" value="${fecha}" disabled>
        <input id="hora" class="swal2-input" value="${hora}" disabled>
        <select id="producto" class="swal2-input">
          ${productos
            .map(
              (producto: any) =>
                `<option value="${producto._id}">${producto.nombre}</option>`
            )
            .join("")}
        </select>
        <input id="cantidad" type="number" class="swal2-input" placeholder="Cantidad">
        <button id="agregarProductoBtn" class="swal2-confirm swal2-styled">Agregar Producto</button>
      `,
      showCancelButton: true,
      confirmButtonText: "Ver Productos Agregados",
      cancelButtonText: "Cancelar",
      willOpen: () => {
        document
          .getElementById("agregarProductoBtn")
          ?.addEventListener("click", () => {
            const productoSelect = document.getElementById(
              "producto"
            ) as HTMLSelectElement | null;
            const cantidadInput = document.getElementById(
              "cantidad"
            ) as HTMLInputElement | null;

            if (!productoSelect || !cantidadInput) {
              Swal.fire(
                "Error",
                "Hubo un problema al intentar agregar el producto.",
                "error"
              );
              return;
            }

            const productoId = productoSelect.value;
            const cantidad = parseInt(cantidadInput.value);

            if (!productoId || isNaN(cantidad) || cantidad <= 0) {
              Swal.fire(
                "Error",
                "Debe seleccionar un producto y una cantidad válida.",
                "error"
              );
              return;
            }

            const producto = productos.find((p: any) => p._id === productoId);

            if (!producto || cantidad > producto.stock) {
              Swal.fire(
                "Error",
                "No hay suficiente stock disponible para este producto.",
                "error"
              );
              return;
            }

            const total = producto.precioVenta * cantidad;

            productosSeleccionados.push({
              productoId,
              nombre: producto.nombre,
              cantidad,
              total,
            });

            cantidadInput.value = "";
          });
      },
      preConfirm: () => {
        if (productosSeleccionados.length === 0) {
          Swal.showValidationMessage(
            "Debe agregar al menos un producto antes de continuar."
          );
          return false;
        }
        showProductsSwal();
        return false;
      },
    });
  };

  const deleteVenta = async (id: string) => {
    const result = await MySwal.fire({
      title: "¿Estás seguro de anular esta venta?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Anular",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/ventas/${id}`, {
          data: { usuarioId: userId },
        });
        fetchVentas(userId);
        Swal.fire("Anulada", "La venta fue anulada correctamente", "success");
      } catch (error) {
        console.error("Error al anular la venta", error);
        Swal.fire("Error", "No se pudo anular la venta", "error");
      }
    }
  };

  const showVentaInfo = (venta: any) => {
    const productosHTML = venta.productos
      .map((prod: any) => {
        const nombreProducto = prod.productoId?.nombre || "Producto eliminado";
        const cantidad = prod.cantidad ?? 0;
        const subtotal = prod.total ? prod.total.toFixed(2) : "0.00";
        return `
        <tr>
          <td>${nombreProducto}</td>
          <td>${cantidad}</td>
          <td>$${subtotal}</td>
        </tr>
      `;
      })
      .join("");

    const totalVentaStr = venta.totalVenta
      ? venta.totalVenta.toFixed(2)
      : "0.00";

    MySwal.fire({
      title: "Información de la Venta",
      html: `
        <table style="width: 100%; margin-bottom: 10px;">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${productosHTML}
          </tbody>
        </table>
        <div><strong>Total Venta:</strong> $${totalVentaStr}</div>
      `,
      confirmButtonText: "Cerrar",
    });
  };

  // Funciones para comenzar y finalizar el día
  const handleStartDay = () => {
    setDayStarted(true);
    localStorage.setItem("dayStarted", "true");
    // Al comenzar el día, se puede volver a buscar ventas (aunque para el inicio del día aún no hay)
    fetchVentas(userId);
    Swal.fire("El día ha comenzado. Ahora puedes registrar ventas.");
  };

  /*
   * AL FINALIZAR EL DÍA:
   * - Calculamos totales por medio de pago
   * - Creamos PDF con jsPDF y autoTable
   * - Descargamos el PDF
   * - Reseteamos estado (dayStarted = false)
   */
  const handleEndDay = () => {
    const efectivoTotal = ventas
      .filter((venta: any) => venta.medioPago === "Efectivo" && !venta.anulada)
      .reduce((acc: number, venta: any) => acc + (venta.totalVenta || 0), 0);

    const debitoTotal = ventas
      .filter(
        (venta: any) => venta.medioPago === "Debito/Credito" && !venta.anulada
      )
      .reduce((acc: number, venta: any) => acc + (venta.totalVenta || 0), 0);

    const tableBody = ventas
      .filter((v: any) => !v.anulada)
      .map((venta: any) => [
        venta.fecha,
        venta.hora,
        venta.empleadoId?.nombre || "Sin Vendedor",
        venta.medioPago,
        `$${venta.totalVenta?.toFixed(2) || 0}`,
      ]);

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Informe de Cierre de Caja", 10, 10);

    doc.setFontSize(12);
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${anio}`;
    doc.text(`${businessName}`, 10, 20);
    doc.text(`Fecha: ${fechaFormateada}`, 10, 27);
    doc.text(`Efectivo: $${efectivoTotal.toFixed(2)}`, 10, 40);
    doc.text(`Débito / Crédito: $${debitoTotal.toFixed(2)}`, 10, 47);

    autoTable(doc, {
      startY: 55,
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

    const nombreFecha = fechaFormateada.replace(/\//g, "_");
    doc.save(`cierre_caja_${nombreFecha}.pdf`);

    setDayStarted(false);
    localStorage.setItem("dayStarted", "false");
    Swal.fire(
      "El día ha finalizado. No se podrán registrar más ventas hasta mañana."
    );
  };

  return (
    <div className="container">
      <button
        className="btn btn-secondary volver-btn"
        onClick={() => (window.location.href = "/")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      {/* Botón para agregar ventas: se habilita solo si el día está iniciado */}
      <button
        className="btn btn-primary agregar-producto-btn"
        onClick={openAddVentaModal}
        title={!dayStarted ? "Debes comenzar el día primero" : ""}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <div className="productos-texts">
        <h1>Caja del Día</h1>
        <p>
          Desde acá podés registrar, visualizar o anular ventas del día.{" "}
          {!dayStarted && "El día aún no ha comenzado."}
        </p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por vendedor/a, medio de pago, total o fecha..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Productos</th>
              <th>Vendedor</th>
              <th>Medio de Pago</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!dayStarted ? (
              <tr>
                <td colSpan={7} className="no-data">
                  El día aún no ha comenzado. Presiona "Comenzar el día" para
                  iniciar.
                </td>
              </tr>
            ) : filteredVentas.length > 0 ? (
              filteredVentas.map((venta: any) => {
                const isAnulada = venta.anulada; // Suponemos que es true cuando la venta está anulada
                return (
                  <tr
                    key={venta._id}
                    style={isAnulada ? { backgroundColor: "#d3d3d3" } : {}}
                  >
                    <td>
                      <button
                        className="lista-btn"
                        onClick={() => !isAnulada && showVentaInfo(venta)}
                        disabled={isAnulada}
                      >
                        <FontAwesomeIcon icon={faBoxesPacking} />
                      </button>
                    </td>
                    <td>{venta.empleadoId?.nombre}</td>
                    <td>{venta.medioPago}</td>
                    <td>${venta.totalVenta}</td>
                    <td>{venta.fecha}</td>
                    <td>{venta.hora}</td>
                    <td>
                      {isAnulada ? (
                        <span>ANULADA</span>
                      ) : (
                        <button
                          className="eliminar-btn"
                          onClick={() => deleteVenta(venta._id)}
                          disabled={isAnulada}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="no-data">
                  Todavía no hay información en la tabla.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botón para comenzar o finalizar el día */}
      <div className="day-actions" style={{ marginTop: "20px" }}>
        {!dayStarted ? (
          <button className="btn comenzar-btn" onClick={handleStartDay}>
            Comenzar el día
          </button>
        ) : (
          <button className="btn finalizar-btn" onClick={handleEndDay}>
            Finalizar día
          </button>
        )}
      </div>
    </div>
  );
}
