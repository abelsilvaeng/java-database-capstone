/* adminDashboard.js - doctor roster: list, filter and add. */

import { openModal } from "./components/modals.js";
import { getDoctors, filterDoctors, saveDoctor } from "./services/doctorServices.js";
import { createDoctorCard } from "./components/doctorCard.js";

window.openModal = openModal;

document.addEventListener("DOMContentLoaded", () => {
  loadDoctorCards();

  const searchBar = document.getElementById("searchBar");
  const timeFilter = document.getElementById("filterTime");
  const specialtyFilter = document.getElementById("filterSpecialty");

  if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
  if (timeFilter) timeFilter.addEventListener("change", filterDoctorsOnChange);
  if (specialtyFilter) specialtyFilter.addEventListener("change", filterDoctorsOnChange);

  const addBtn = document.getElementById("addDocBtn");
  if (addBtn) addBtn.addEventListener("click", () => openModal("addDoctor"));
});

async function loadDoctorCards() {
  const doctors = await getDoctors();
  renderDoctorCards(doctors);
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

/** Called by the Add Doctor modal. */
window.adminAddDoctor = async function () {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Your session expired. Please log in again.");
    return;
  }

  const availableTimes = Array.from(
    document.querySelectorAll("input[name='availability']:checked")
  ).map((checkbox) => checkbox.value);

  const doctor = {
    name: document.getElementById("doctorName").value.trim(),
    specialty: document.getElementById("specialization").value,
    email: document.getElementById("doctorEmail").value.trim(),
    password: document.getElementById("doctorPassword").value,
    phone: document.getElementById("doctorPhone").value.trim(),
    availableTimes
  };

  const result = await saveDoctor(doctor, token);
  alert(result.message);
  if (result.success) {
    document.getElementById("modal").style.display = "none";
    loadDoctorCards();
  }
};

window.loadDoctorCards = loadDoctorCards;
