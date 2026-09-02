/* updateAppointment.js - lets a patient move an existing booking to another free slot. */

import { getDoctorAvailability } from "./services/doctorServices.js";
import { updateAppointment } from "./services/appointmentRecordService.js";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const appointmentId = params.get("appointmentId");
  const doctorId = params.get("doctorId");
  const patientId = params.get("patientId");
  const token = localStorage.getItem("token");

  const dateInput = document.getElementById("appointmentDate");
  const slotSelect = document.getElementById("appointmentTime");

  if (dateInput) {
    dateInput.value = todayISO();
    dateInput.min = todayISO();
    dateInput.addEventListener("change", loadSlots);
  }

  async function loadSlots() {
    if (!slotSelect) return;
    const slots = await getDoctorAvailability("patient", doctorId, dateInput.value, token);
    slotSelect.innerHTML = slots.length
      ? slots.map((slot) => `<option value="${slot}">${slot}</option>`).join("")
      : `<option value="">No slots available on this date</option>`;
  }

  loadSlots();

  const updateBtn = document.getElementById("updateAppointmentBtn");
  if (updateBtn) {
    updateBtn.addEventListener("click", async () => {
      const slot = slotSelect.value;
      if (!slot) {
        alert("Please pick an available time slot.");
        return;
      }

      const startTime = slot.split("-")[0].trim();
      const appointment = {
        id: Number(appointmentId),
        doctor: { id: Number(doctorId) },
        patient: { id: Number(patientId) },
        appointmentTime: `${dateInput.value}T${startTime}:00`,
        status: 0
      };

      const result = await updateAppointment(appointment, token);
      alert(result.message);
      if (result.success) {
        window.location.href = "/pages/patientAppointments.html";
      }
    });
  }
});
