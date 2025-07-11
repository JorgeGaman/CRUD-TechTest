document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formulario-promocion");
  const tableBody = document.getElementById("tbody-promociones");

  loadPromotions();

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const promotion = {
      nombre: formData.get("nombre"),
      importe: parseFloat(formData.get("importe")),
      moneda: formData.get("moneda"),
      fecha_inicio: formData.get("fecha"),
      fecha_fin: formData.get("fechafin"),
      estatus: "pendiente",
      comentario: "",
    };

    if (isNaN(promotion.importe) || promotion.importe <= 0) {
      alert("El importe debe ser un número positivo.");
      return;
    }

    const startDate = new Date(promotion.fecha_inicio);
    const endDate = new Date(promotion.fecha_fin);
    const currentDate = new Date();

    if (startDate >= endDate) {
      alert("La fecha de inicio debe ser anterior a la fecha de fin.");
      return;
    }

    if (startDate < currentDate) {
      alert("La fecha de inicio no puede ser anterior a la fecha actual.");
      return;
    }

    fetch("/api/promotions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promotion),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Promotion response:", data);
        if (data.success) {
          alert("Promoción enviada correctamente");
          form.reset();
          loadPromotions();
        } else {
          alert("Error al enviar la promoción");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error al enviar la promoción");
      });
  });

  function loadPromotions() {
    fetch("/api/promotions")
      .then((response) => response.json())
      .then((promotions) => {
        renderPromotions(promotions);
      })
      .catch((error) => {
        console.error("Error loading promotions:", error);
      });
  }
  function renderPromotions(promotions) {
    tableBody.innerHTML = "";

    promotions.forEach((promotion) => {
      const row = document.createElement("tr");

      if (promotion.estatus === "aprobado") {
        row.classList.add("status-approved");
      } else if (promotion.estatus === "rechazado") {
        row.classList.add("status-rejected");
      } else {
        row.classList.add("status-pending");
      }

      row.innerHTML = `
                <td>${promotion.producto}</td>
                <td>$${promotion.importe}</td>
                <td>${promotion.moneda}</td>
                <td>${formatDate(promotion.fecha_inicio)}</td>
                <td>${formatDate(promotion.fecha_fin)}</td>
                <td>
                    <span class="status-badge status-${promotion.estatus}">
                        ${
                          promotion.estatus.charAt(0).toUpperCase() +
                          promotion.estatus.slice(1)
                        }
                    </span>
                </td>
                <td>${promotion.comentario || "-"}</td>
                <td>
                    ${
                      promotion.estatus === "pendiente"
                        ? `
                        <button class="btn btn-approve" onclick="approvePromotion(${promotion.id})">
                            Aprobar
                        </button>
                        <button class="btn btn-reject" onclick="rejectPromotion(${promotion.id})">
                            Rechazar
                        </button>
                    `
                        : `
                        <span class="status-text">
                            ${
                              promotion.estatus === "aprobado"
                                ? "Aprobado"
                                : "Rechazado"
                            }
                        </span>
                    `
                    }
                </td>
            `;

      tableBody.appendChild(row);
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  window.approvePromotion = function (id) {
    updatePromotionStatus(id, "aprobado", "");
  };

  window.rejectPromotion = function (id) {
    const comment = prompt(
      "Por favor, ingresa un comentario explicando el motivo del rechazo:"
    );

    if (comment === null) {
      return;
    }

    if (comment.trim() === "") {
      alert(
        "Es obligatorio ingresar un comentario para rechazar una promoción."
      );
      return;
    }

    updatePromotionStatus(id, "rechazado", comment.trim());
  };

  function updatePromotionStatus(id, estatus, comentario) {
    fetch(`/api/promotions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        estatus: estatus,
        comentario: comentario,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(
            `Promoción ${
              estatus === "aprobado" ? "aprobada" : "rechazada"
            } correctamente`
          );
          loadPromotions();
        } else {
          alert("Error al actualizar el estatus de la promoción");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error al actualizar el estatus de la promoción");
      });
  }
});
