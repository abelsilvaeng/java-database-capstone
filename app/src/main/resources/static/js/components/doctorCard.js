/* doctorCard.js - one card per doctor. The actions on it depend on who is looking. */

import { deleteDoctor } from "../services/doctorServices.js";
import { getPatientData } from "../services/patientServices.js";
import { showBookingOverlay } from "../loggedPatient.js";

export function createDoctorCard(doctor) {
  const card = document.createElement("div");
  card.className = "doctor-card";

  const info = document.createElement("div");
  info.className = "doctor-info";
  info.innerHTML = `
    <h3>${doctor.name}</h3>
    <p><strong>Specialty:</strong> ${doctor.specialty}</p>
    <p><strong>Email:</strong> ${doctor.email}</p>
    <p><strong>Available:</strong> ${(doctor.availableTimes || []).join(", ") || "No slots published"}</p>`;

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const role = localStorage.getItem("userRole");

  if (role === "admin") {
    const removeBtn = document.createElement("button");
    removeBtn.className = "adminBtn";
    removeBtn.textContent = "Delete";
    removeBtn.addEventListener("click", async () => {
      if (!confirm(`Delete ${doctor.name}? Their appointments will be removed too.`)) return;
      const token = localStorage.getItem("token");
      const result = await deleteDoctor(doctor.id, token);
      alert(result.message);
      if (result.success) card.remove();
    });
    actions.appendChild(removeBtn);

  } else if (role === "patient") {
    const bookBtn = document.createElement("button");
    bookBtn.className = "adminBtn";
    bookBtn.textContent = "Book Now";
    bookBtn.addEventListener("click", () => alert("Please log in to book an appointment."));
    actions.appendChild(bookBtn);

  } else if (role === "loggedPatient") {
    const bookBtn = document.createElement("button");
    bookBtn.className = "adminBtn";
    bookBtn.textContent = "Book Now";
    bookBtn.addEventListener("click", async (event) => {
      const token = localStorage.getItem("token");
      const patient = await getPatientData(token);
      if (!patient) {
        alert("Your session expired. Please log in again.");
        return;
      }
      showBookingOverlay(event, doctor, patient);
    });
    actions.appendChild(bookBtn);
  }

  card.appendChild(info);
  card.appendChild(actions);
  return card;
}

window.createDoctorCard = createDoctorCard;
