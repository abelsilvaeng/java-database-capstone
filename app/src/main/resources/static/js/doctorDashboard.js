/* doctorDashboard.js - the appointments a doctor has on a chosen day. */

import { getAllAppointments } from "./services/appointmentRecordService.js";
import { createPatientRow } from "./components/patientRows.js";

let selectedDate = todayISO();
let patientName = "";

document.addEventListener("DOMContentLoaded", () => {
  const datePicker = document.getElementById("datePicker");
  const todayButton = document.getElementById("todayButton");
  const searchBar = document.getElementById("searchBar");

  if (datePicker) {
    datePicker.value = selectedDate;
    datePicker.addEventListener("change", (event) => {
      selectedDate = event.target.value;
      loadAppointments();
    });
  }

  if (todayButton) {
    todayButton.addEventListener("click", () => {
      selectedDate = todayISO();
      if (datePicker) datePicker.value = selectedDate;
      loadAppointments();
    });
  }

  if (searchBar) {
    searchBar.addEventListener("input", (event) => {
      patientName = event.target.value.trim();
      loadAppointments();
    });
  }

  loadAppointments();
});

async function loadAppointments() {
  const tableBody = document.getElementById("patientTableBody");
  if (!tableBody) return;

  const token = localStorage.getItem("token");
  const data = await getAllAppointments(selectedDate, patientName, token);
  const appointments = data.appointments || [];

  tableBody.innerHTML = "";

  if (appointments.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="noPatientRecord">No Appointments found for today.</td>`;
    tableBody.appendChild(row);
    return;
  }

  appointments.forEach((appointment) => tableBody.appendChild(createPatientRow(appointment)));
}

window.loadAppointments = loadAppointments;
