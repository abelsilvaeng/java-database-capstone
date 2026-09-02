/* patientRecordRow.js - one row of a patient's clinical record, prescription included. */

export function createPatientRecordRow(appointment, prescription) {
  const row = document.createElement("tr");
  const entry = Array.isArray(prescription) ? prescription[0] : prescription;

  row.innerHTML = `
    <td>${appointment.id}</td>
    <td>${formatDate(appointment.appointmentTime)}</td>
    <td>${formatTime(appointment.appointmentTime)}</td>
    <td>${appointment.doctorName ?? ""}</td>
    <td>${entry ? entry.medication : "-"}</td>
    <td>${entry ? entry.dosage : "-"}</td>
    <td>${entry && entry.doctorNotes ? entry.doctorNotes : "-"}</td>`;

  return row;
}

window.createPatientRecordRow = createPatientRecordRow;
