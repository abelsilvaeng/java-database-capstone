/* appointmentRow.js - one row of the patient's own appointment list. */

export function createAppointmentRow(appointment) {
  const row = document.createElement("tr");
  const isUpcoming = appointment.status === 0;

  row.innerHTML = `
    <td>${appointment.id}</td>
    <td>${appointment.doctorName ?? ""}</td>
    <td>${formatDate(appointment.appointmentTime)}</td>
    <td>${formatTime(appointment.appointmentTime)}</td>
    <td>${isUpcoming ? "Scheduled" : "Completed"}</td>
    <td class="card-actions"></td>`;

  const actions = row.querySelector(".card-actions");

  if (isUpcoming) {
    const editBtn = document.createElement("img");
    editBtn.src = "/assets/images/edit/edit.png";
    editBtn.alt = "Edit appointment";
    editBtn.className = "prescription-btn";
    editBtn.addEventListener("click", () => {
      window.location.href =
        `/pages/updateAppointment.html?appointmentId=${appointment.id}` +
        `&doctorId=${appointment.doctorId}&patientId=${appointment.patientId}`;
    });
    actions.appendChild(editBtn);
  } else {
    actions.textContent = "-";
  }

  return row;
}

window.createAppointmentRow = createAppointmentRow;
