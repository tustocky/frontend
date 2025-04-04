"use client";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faCashRegister,
  faUserGroup,
  faTag,
  faClock,
  faFilePdf,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

export default function promo() {
  // Función para abrir WhatsApp con un mensaje predefinido
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      "¡Hola! Estoy interesado en saber más sobre Stocky. ¿Podrías contarme cómo funciona y cuáles son sus beneficios para mi negocio?"
    );
    window.open(`https://wa.me/541134231260?text=${text}`, "_blank");
  };

  return (
    <div className="stocky-container">
      <button className="contactanos-btn" onClick={handleWhatsApp}>
        Contáctanos
      </button>
      <h1>
        ¿Qué es <span className="logo">Stocky</span>?
      </h1>
      <p className="subtitles">
        Stocky es una herramienta simple, ágil y pensada para ayudarte a
        organizar tu negocio. Con Stocky podés llevar el control de productos,
        ventas, empleados ¡y mucho más!
      </p>
      <div className="features-grid">
        <div className="feature-card">
          <FontAwesomeIcon
            icon={faBoxesStacked}
            size="2x"
            className="icono-feature"
          />
          <h3>Gestión de Productos</h3>
          <p>
            Agregá productos con nombre, precio y categoría. Todo ordenado y
            fácil de editar.
          </p>
        </div>

        <div className="feature-card">
          <FontAwesomeIcon
            icon={faCashRegister}
            size="2x"
            className="icono-feature"
          />
          <h3>Caja del Día</h3>
          <p>Registrá tus ventas y controlá el stock al instante.</p>
        </div>

        <div className="feature-card">
          <FontAwesomeIcon
            icon={faUserGroup}
            size="2x"
            className="icono-feature"
          />
          <h3>Empleados</h3>
          <p>Controlá fácilmente el trabajo de tu equipo.</p>
        </div>

        <div className="feature-card">
          <FontAwesomeIcon icon={faClock} size="2x" className="icono-feature" />
          <h3>Ahorrá tiempo</h3>
          <p>
            Simplificá tu negocio y cerrá tu caja de forma fácil todos los días.
          </p>
        </div>

        <div className="feature-card">
          <FontAwesomeIcon
            icon={faFilePdf}
            size="2x"
            className="icono-feature"
          />
          <h3>Informes en PDF</h3>
          <p>Generá y descargá informes diarios de tus ventas con un click.</p>
        </div>

        <div className="feature-card">
          <FontAwesomeIcon icon={faBell} size="2x" className="icono-feature" />
          <h3>Notificaciones</h3>
          <p>Recibí notificaciones directamente en tu celular.</p>
        </div>
      </div>

      <p className="final-note">
        Stocky está diseñado para ser{" "}
        <span className="strong">fácil de usar</span>, sin complicaciones ni
        sistemas complejos. Todo lo que necesitás para administrar tu negocio en
        un solo lugar.
      </p>
      <p>
        ¿Tenés alguna duda o sugerencia sobre Stocky? Estamos para ayudarte.
        Mandanos un{" "}
        <a className="link" href="mailto:axelportillo@tustocky.ar">
          email
        </a>{" "}
        y te vamos a responder a la brevedad.
      </p>
    </div>
  );
}
