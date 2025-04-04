"use client";
import { useState } from "react";

export default function AddProductModal({ closeModal }: { closeModal: () => void }) {
  const [nombre, setNombre] = useState("");
  const [precioCosto, setPrecioCosto] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [tipo, setTipo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Producto agregado:", { nombre, precioCosto, precioVenta, tipo });
    alert("Producto agregado (aún falta backend)");
    closeModal();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 fade-in">
      <div className="card w-96">
        <h2 className="text-xl font-bold mb-4">Agregar Producto</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre del Producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Precio de Costo"
            value={precioCosto}
            onChange={(e) => setPrecioCosto(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Precio de Venta"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Tipo de Producto"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          />
          <div className="flex justify-end space-x-2">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
