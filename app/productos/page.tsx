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
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";

const MySwal = withReactContent(Swal);

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");
    if (userIdFromStorage) {
      setUserId(userIdFromStorage);
      fetchProductos(userIdFromStorage);
      fetchCategorias(userIdFromStorage);
    }
  }, []);

  const fetchProductos = async (userId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/productos/${userId}`
      );      
      setProductos(response.data);
      setFilteredProductos(response.data); // Copia original para filtrado
    } catch (error) {
      console.error("Error al obtener productos", error);
    }
  };

  const fetchCategorias = async (userId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categorias/${userId}`
      );      
      setCategorias(response.data);
    } catch (error) {
      console.error("Error al obtener categorías", error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = productos.filter(
      (producto: any) =>
        producto.nombre.toLowerCase().includes(searchValue) ||
        producto.idCategoria.categoria.toLowerCase().includes(searchValue)
    );

    setFilteredProductos(filtered);
  };

  const openAddProductModal = () => {
    const categoriasOptions = categorias
      .filter((cat: any) => cat.categoria !== "Oferta") // 🔥 Acá se excluye "Oferta"
      .map((cat: any) => `<option value="${cat._id}">${cat.categoria}</option>`)
      .join("");

    MySwal.fire({
      title: "Agregar Producto",
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre del Producto">
        <select id="idCategoria" class="swal2-input">${categoriasOptions}</select>
        <input id="precioCosto" type="number" class="swal2-input" placeholder="Precio de Costo">
        <input id="precioVenta" type="number" class="swal2-input" placeholder="Precio de Venta">
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const nombre = (document.getElementById("nombre") as HTMLInputElement)
          .value;
        const idCategoria = (
          document.getElementById("idCategoria") as HTMLSelectElement
        ).value;
        const precioCosto = (
          document.getElementById("precioCosto") as HTMLInputElement
        ).value;
        const precioVenta = (
          document.getElementById("precioVenta") as HTMLInputElement
        ).value;

        if (!nombre || !idCategoria || !precioCosto || !precioVenta) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/productos`,
            {
              nombre,
              idCategoria,
              precioCosto: parseFloat(precioCosto),
              precioVenta: parseFloat(precioVenta),
              usuarioId: userId,
            }
          );          

          if (response.status === 201) {
            fetchProductos(userId);
            return true;
          }
        } catch (error) {
          Swal.showValidationMessage("Error al guardar producto");
          return false;
        }
      },
    });
  };

  const openEditProductModal = (producto: any) => {
    const esOferta = producto.idCategoria?.categoria === "Oferta";

    const categoriasOptions = categorias
      .map(
        (cat: any) =>
          `<option value="${cat._id}" ${
            producto.idCategoria._id === cat._id ? "selected" : ""
          }>${cat.categoria}</option>`
      )
      .join("");

    MySwal.fire({
      title: "Editar Producto",
      html: `
        <input id="nombre" class="swal2-input" value="${
          producto.nombre
        }" placeholder="Nombre del Producto">
        <select id="idCategoria" class="swal2-input" ${
          esOferta ? "disabled" : ""
        }>
          ${categoriasOptions}
        </select>
        <input id="precioCosto" type="number" class="swal2-input" value="${
          producto.precioCosto
        }" placeholder="Precio de Costo">
        <input id="precioVenta" type="number" class="swal2-input" value="${
          producto.precioVenta
        }" placeholder="Precio de Venta">
      `,
      showCancelButton: true,
      confirmButtonText: "Actualizar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const nombre = (document.getElementById("nombre") as HTMLInputElement)
          .value;
        const idCategoria = esOferta
          ? producto.idCategoria._id // mantiene la categoría si está deshabilitado
          : (document.getElementById("idCategoria") as HTMLSelectElement).value;
        const precioCosto = (
          document.getElementById("precioCosto") as HTMLInputElement
        ).value;
        const precioVenta = (
          document.getElementById("precioVenta") as HTMLInputElement
        ).value;

        if (!nombre || !idCategoria || !precioCosto || !precioVenta) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }

        try {
          const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/api/productos/${producto._id}`,
            {
              nombre,
              idCategoria,
              precioCosto: parseFloat(precioCosto),
              precioVenta: parseFloat(precioVenta),
              usuarioId: userId,
            }
          );          

          if (response.status === 200) {
            fetchProductos(userId);
            return true;
          }
        } catch (error) {
          Swal.showValidationMessage("Error al actualizar producto");
          return false;
        }
      },
    });
  };

  const openAddOfferModal = () => {
    // Obtener el ID de la categoría "Oferta"
    const categoriaOferta = categorias.find(
      (cat: any) => cat.categoria === "Oferta"
    );
    const idCategoriaOferta = categoriaOferta ? categoriaOferta._id : "";

    if (!idCategoriaOferta) {
      Swal.fire("Error", "No se encontró la categoría 'Oferta'", "error");
      return;
    }

    let producto1Seleccionado = ""; // Para almacenar el ID del primer producto seleccionado

    const renderSelectOptions = (excluirProductoId = "") => {
      return productos
        .filter(
          (prod: any) =>
            prod._id !== excluirProductoId &&
            prod.idCategoria?.categoria !== "Oferta"
        )
        .map(
          (prod: any) => `<option value="${prod._id}">${prod.nombre}</option>`
        )
        .join("");
    };

    MySwal.fire({
      title: "Agregar Oferta",
      html: `
        <select id="producto1" class="swal2-input">${renderSelectOptions()}</select>
        <select id="producto2" class="swal2-input">${renderSelectOptions()}</select>
        <input id="nombreOferta" class="swal2-input" placeholder="Nombre de la Oferta" disabled>
        <input id="precioCosto" type="number" class="swal2-input" placeholder="Precio de Costo">
        <input id="precioVenta" type="number" class="swal2-input" placeholder="Precio de Venta">
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      willOpen: () => {
        const select1 = document.getElementById(
          "producto1"
        ) as HTMLSelectElement;
        const select2 = document.getElementById(
          "producto2"
        ) as HTMLSelectElement;
        const nombreOfertaInput = document.getElementById(
          "nombreOferta"
        ) as HTMLInputElement;

        const updateNombreOferta = () => {
          const producto1 = select1.options[select1.selectedIndex]?.text || "";
          const producto2 = select2.options[select2.selectedIndex]?.text || "";
          nombreOfertaInput.value = `${producto1} + ${producto2}`;
        };

        const updateProducto2Options = () => {
          producto1Seleccionado = select1.value;
          select2.innerHTML = renderSelectOptions(producto1Seleccionado);
          updateNombreOferta();
        };

        select1.addEventListener("change", updateProducto2Options);
        select2.addEventListener("change", updateNombreOferta);

        // Inicializar
        updateProducto2Options();
      },
      preConfirm: async () => {
        const nombre = (
          document.getElementById("nombreOferta") as HTMLInputElement
        ).value;
        const idCategoria = idCategoriaOferta;
        const precioCosto = (
          document.getElementById("precioCosto") as HTMLInputElement
        ).value;
        const precioVenta = (
          document.getElementById("precioVenta") as HTMLInputElement
        ).value;

        if (!nombre || !idCategoria || !precioCosto || !precioVenta) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/productos`,
            {
              nombre,
              idCategoria,
              precioCosto: parseFloat(precioCosto),
              precioVenta: parseFloat(precioVenta),
              usuarioId: userId,
            }
          );          

          if (response.status === 201) {
            fetchProductos(userId);
            return true;
          }
        } catch (error) {
          Swal.showValidationMessage("Error al guardar la oferta");
          return false;
        }
      },
    });
  };

  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/productos/${id}`, {
        data: { usuarioId: userId },
      });      
      fetchProductos(userId);
      Swal.fire("Eliminado", "Producto eliminado correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  return (
    <div className="container">
      <button
        className="btn btn-secondary volver-btn"
        onClick={() => (window.location.href = "/")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <button
        className="btn btn-primary agregar-producto-btn"
        onClick={openAddProductModal}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <button
        className="btn btn-primary agregar-oferta-btn"
        onClick={openAddOfferModal}
      >
        <FontAwesomeIcon icon={faDollarSign} />
      </button>

      <div className="productos-texts">
        <h1>Mis Productos</h1>
        <p>Desde acá podés agregar, editar o eliminar tus productos.</p>
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
              <th>Precio de Venta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductos.length > 0 ? (
              filteredProductos.map((producto: any) => (
                <tr key={producto._id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.idCategoria.categoria}</td>
                  <td>{producto.precioCosto}</td>
                  <td>{producto.precioVenta}</td>
                  <td>
                    <button
                      className="editar-btn"
                      onClick={() => openEditProductModal(producto)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className="eliminar-btn"
                      onClick={() => deleteProduct(producto._id)}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="no-data">
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
