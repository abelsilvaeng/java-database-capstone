/* loggedPatient.js - the doctor list as a logged-in patient sees it, with booking. */

import { getDoctors, filterDoctors, getDoctorAvailability } from "./services/doctorServices.js";
import { createDoctorCard } from "./components/doctorCard.js";
import { bookAppointment } from "./services/appointmentRecordService.js";

document.addEventListener("DOMContentLoaded", () => {
  localStorage.setItem("userRole", "loggedPatient");
  loadDoctorCards();

  const searchBar = document.getElementById("searchBar");
  const timeFilter = document.getElementById("filterTime");
  const specialtyFilter = document.getElementById("filterSpecialty");

  if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
  if (timeFilter) timeFilter.addEventListener("change", filterDoctorsOnChange);
  if (specialtyFilter) specialtyFilter.addEventListener("change", filterDoctorsOnChange);
});

async function loadDoctorCards() {
  renderDoctorCards(await getDoctors());
}

function renderDoctorCards(doctors) {
  const content = document.getElementById("content");
  if (!content) return;

  content.innerHTML = "";
  if (!doctors || doctors.length === 0) {
    content.innerHTML = "<p class='noPatientRecord'>No doctors found.</p>";
    return;
  }
  doctors.forEach((doctor) => content.appendChild(createDoctorCard(doctor)));
}

async function filterDoctorsOnChange() {
  const name = document.getElementById("searchBar")?.value || "";
  const time = document.getElementById("filterTime")?.value || "";
  const specialty = document.getElementById("filterSpecialty")?.value || "";

  const result = await filterDoctors(name, time, specialty);
  renderDoctorCards(result.doctors || []);
}

/**
 * Booking overlay: pick a date, load that doctor's remaining slots for it, confirm.
 * Slots come from the server so a taken hour never shows up as available.
 */
export function showBookingOverlay(event, doctor, patient) {
  const existing = document.getElementById("bookingOverlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "bookingOverlay";
  overlay.className = "modalApp";
  overlay.innerHTML = `
    <div class="modal-content">
      <span class="close" id="closeBooking">&times;</span>
      <h2>Book with ${doctor.name}</h2>
      <p><strong>Specialty:</strong> ${doctor.specialty}</p>
      <p><strong>Patient:</strong> ${patient.name}</p>
      <label for="bookingDate">Date</label>
      <input type="date" id="bookingDate" class="date-picker" value="${todayISO()}" min="${todayISO()}">
      <label for="bookingSlot">Available time</label>
      <select id="bookingSlot" class="select-dropdown"><option value="">Select a date first</option></select>
      <button class="confirm-booking" id="confirmBooking">Confirm Booking</button>
    </div>`;

  document.body.appendChild(overlay);
  overlay.style.display = "block";

  document.getElementById("closeBooking").onclick = () => overlay.remove();

  const dateInput = document.getElementById("bookingDate");
  const slotSelect = document.getElementById("bookingSlot");

  const loadSlots = async () => {
    const token = localStorage.getItem("token");
    const slots = await getDoctorAvailability("patient", doctor.id, dateInput.value, token);
    slotSelect.innerHTML = slots.length
      ? slots.map((slot) => `<option value="${slot}">${slot}</option>`).join("")
      : `<option value="">No slots available on this date</option>`;
  };

  dateInput.addEventListener("change", loadSlots);
  loadSlots();

  document.getElementById("confirmBooking").addEventListener("click", async () => {
    const slot = slotSelect.value;
    if (!slot) {
      alert("Please pick an available time slot.");
      return;
    }

    const startTime = slot.split("-")[0].trim();
    const appointment = {
      doctor: { id: doctor.id },
      patient: { id: patient.id },
      appointmentTime: `${dateInput.value}T${startTime}:00`,
      status: 0
    };

    const token = localStorage.getItem("token");
    const result = await bookAppointment(appointment, token);
    alert(result.message);
    if (result.success) {
      overlay.remove();
      window.location.href = "/pages/patientAppointments.html";
    }
  });
}

window.showBookingOverlay = showBookingOverlay;
