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
  faPen,
} from "@fortawesome/free-solid-svg-icons";

const MySwal = withReactContent(Swal);

export default function Stock() {
  const [productos, setProductos] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");
    if (userIdFromStorage) {
      setUserId(userIdFromStorage);
      fetchProductos(userIdFromStorage);
      fetchStock(userIdFromStorage);
    }
  }, []);

  const fetchProductos = async (userId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/productos/${userId}`
      );
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos", error);
    }
  };

  const fetchStock = async (userId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/stock/${userId}`
      );
      setStockItems(response.data);
      setFilteredStock(response.data);
    } catch (error) {
      console.error("Error al obtener stock", error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = stockItems.filter(
      (stockItem: any) =>
        stockItem.producto?.nombre.toLowerCase().includes(searchValue) ||
        stockItem.producto?.idCategoria.categoria
          .toLowerCase()
          .includes(searchValue)
    );

    setFilteredStock(filtered);
  };

  const openAddStockModal = () => {
    MySwal.fire({
      title: "Agregar Stock",
      html: `
        <select id="producto" class="swal2-input">
          ${productos
            .map(
              (producto: any) =>
                `<option value="${producto._id}">${producto.nombre}</option>`
            )
            .join("")}
        </select>
        <input id="cantidad" type="number" class="swal2-input" placeholder="Cantidad">
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const productoId = (
          document.getElementById("producto") as HTMLSelectElement
        ).value;
        const cantidad = (
          document.getElementById("cantidad") as HTMLInputElement
        ).value;

        if (!productoId || !cantidad) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }

        try {
          await axios.post("http://localhost:5000/api/stock", {
            productoId,
            cantidad: parseInt(cantidad),
            usuarioId: userId,
          });

          fetchStock(userId);
          return true;
        } catch (error) {
          Swal.showValidationMessage("Error al agregar stock");
          return false;
        }
      },
    });
  };

  const openEditStockModal = (stockItem: any) => {
    MySwal.fire({
      title: "Editar Stock",
      html: `
        <div style="margin-bottom: 10px;">
          <strong>Producto:</strong> ${stockItem.producto.nombre}
        </div>
        <input id="cantidad" type="number" class="swal2-input" value="${stockItem.cantidad}">
      `,
      showCancelButton: true,
      confirmButtonText: "Actualizar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const cantidad = (
          document.getElementById("cantidad") as HTMLInputElement
        ).value;

        if (!cantidad) {
          Swal.showValidationMessage("La cantidad es obligatoria");
          return false;
        }

        try {
          await axios.put(`http://localhost:5000/api/stock/${stockItem._id}`, {
            cantidad: parseInt(cantidad),
            usuarioId: userId,
          });

          fetchStock(userId);
          return true;
        } catch (error) {
          Swal.showValidationMessage("Error al actualizar stock");
          return false;
        }
      },
    });
  };

  const deleteStockItem = async (id: string) => {
    try {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará el stock seleccionado",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete(`http://localhost:5000/api/stock/${id}`, {
            data: { usuarioId: userId },
          });
          fetchStock(userId);
          Swal.fire("Eliminado", "Stock eliminado correctamente", "success");
        }
      });
    } catch (error) {
      console.error("Error al eliminar stock", error);
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

      <button className="btn agregar-btn" onClick={openAddStockModal}>
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <div className="productos-texts">
        <h1>Stock Disponible</h1>
        <p>Desde acá podés agregar, editar o eliminar el stock disponible.</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar producto o categoría..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio de Costo</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.length > 0 ? (
              filteredStock.map((stockItem: any) => (
                <tr key={stockItem._id}>
                  <td>{stockItem.producto?.nombre || "Producto Eliminado"}</td>
                  <td>
                    {stockItem.producto?.idCategoria?.categoria ||
                      "Desconocido"}
                  </td>
                  <td>{stockItem.producto?.precioCosto || "0.00"}</td>
                  <td>{stockItem.cantidad}</td>
                  <td>
                    {stockItem.producto
                      ? (
                          stockItem.cantidad * stockItem.producto.precioCosto
                        ).toFixed(2)
                      : "0.00"}
                  </td>
                  <td>
                    <button
                      className="editar-btn"
                      onClick={() => openEditStockModal(stockItem)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className="eliminar-btn"
                      onClick={() => deleteStockItem(stockItem._id)}
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
