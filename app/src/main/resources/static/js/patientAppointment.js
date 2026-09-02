/* patientAppointment.js - the patient's own appointments, with the past/future filters. */

import { getPatientData, filterAppointments } from "./services/patientServices.js";
import { createAppointmentRow } from "./components/appointmentRow.js";

document.addEventListener("DOMContentLoaded", () => {
  const conditionFilter = document.getElementById("filterCondition");
  const doctorFilter = document.getElementById("searchBar");

  if (conditionFilter) conditionFilter.addEventListener("change", loadAppointments);
  if (doctorFilter) doctorFilter.addEventListener("input", loadAppointments);

  loadAppointments();
});

async function loadAppointments() {
  const tableBody = document.getElementById("patientTableBody");
  if (!tableBody) return;

  const token = localStorage.getItem("token");
  const patient = await getPatientData(token);
  if (!patient) {
    alert("Your session expired. Please log in again.");
    window.location.href = "/pages/patientDashboard.html";
    return;
  }

  const condition = document.getElementById("filterCondition")?.value || "";
  const doctorName = document.getElementById("searchBar")?.value || "";

  const data = await filterAppointments(condition, doctorName, token);
  const appointments = data.appointments || [];

  tableBody.innerHTML = "";
  if (appointments.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="noPatientRecord">No appointments found.</td>`;
    tableBody.appendChild(row);
    return;
  }

  appointments.forEach((appointment) => tableBody.appendChild(createAppointmentRow(appointment)));
}

window.loadAppointments = loadAppointments;
