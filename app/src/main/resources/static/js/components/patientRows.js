/* patientRows.js - one table row per appointment on the doctor dashboard. */

export function createPatientRow(appointment) {
  const patient = appointment.patient || {};
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${patient.id ?? ""}</td>
    <td>${patient.name ?? ""}</td>
    <td>${patient.phone ?? ""}</td>
    <td>${patient.email ?? ""}</td>
    <td>${formatTime(appointment.appointmentTime)}</td>
    <td>
      <img src="/assets/images/addPrescriptionIcon/addPrescription.png"
           alt="Add prescription" class="prescription-btn"
           data-appointment-id="${appointment.id}"
           data-patient-name="${patient.name ?? ""}">
    </td>`;

  const icon = row.querySelector(".prescription-btn");
  icon.addEventListener("click", () => {
    const token = localStorage.getItem("token");
    window.location.href =
      `/pages/addPrescription.html?appointmentId=${appointment.id}` +
      `&patientName=${encodeURIComponent(patient.name ?? "")}&token=${token}`;
  });

  return row;
}

window.createPatientRow = createPatientRow;
