/* patientRecordServices.js - a patient's history joined with the prescription for each visit. */

import { getPatientData, filterAppointments } from "./services/patientServices.js";
import { getPrescription } from "./services/prescriptionServices.js";
import { createPatientRecordRow } from "./components/patientRecordRow.js";

export async function loadPatientRecord() {
  const tableBody = document.getElementById("patientTableBody");
  if (!tableBody) return;

  const token = localStorage.getItem("token");
  const patient = await getPatientData(token);
  if (!patient) {
    alert("Your session expired. Please log in again.");
    window.location.href = "/pages/patientDashboard.html";
    return;
  }

  const nameHeading = document.getElementById("patientName");
  if (nameHeading) nameHeading.textContent = patient.name;

  const data = await filterAppointments("past", "", token);
  const appointments = data.appointments || [];

  tableBody.innerHTML = "";
  if (appointments.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="7" class="noPatientRecord">No past visits recorded yet.</td>`;
    tableBody.appendChild(row);
    return;
  }

  for (const appointment of appointments) {
    const prescription = await getPrescription(appointment.id, token);
    tableBody.appendChild(createPatientRecordRow(appointment, prescription));
  }
}

document.addEventListener("DOMContentLoaded", loadPatientRecord);

window.loadPatientRecord = loadPatientRecord;
