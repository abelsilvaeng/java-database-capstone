/* patientDashboard.js - the public doctor list, plus signup and login for patients. */

import { openModal } from "./components/modals.js";
import { getDoctors, filterDoctors } from "./services/doctorServices.js";
import { createDoctorCard } from "./components/doctorCard.js";
import { patientSignup, patientLogin } from "./services/patientServices.js";

window.openModal = openModal;

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("userRole")) {
    localStorage.setItem("userRole", "patient");
  }
  loadDoctorCards();

  const searchBar = document.getElementById("searchBar");
  const timeFilter = document.getElementById("filterTime");
  const specialtyFilter = document.getElementById("filterSpecialty");

  if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
  if (timeFilter) timeFilter.addEventListener("change", filterDoctorsOnChange);
  if (specialtyFilter) specialtyFilter.addEventListener("change", filterDoctorsOnChange);

  const signupBtn = document.getElementById("patientSignup");
  const loginBtn = document.getElementById("patientLogin");
  if (signupBtn) signupBtn.addEventListener("click", () => openModal("patientSignup"));
  if (loginBtn) loginBtn.addEventListener("click", () => openModal("patientLogin"));
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

window.signupPatient = async function () {
  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim()
  };

  const result = await patientSignup(data);
  alert(result.message);
  if (result.success) {
    document.getElementById("modal").style.display = "none";
    window.location.reload();
  }
};

window.loginPatient = async function () {
  const data = {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  };

  try {
    const response = await patientLogin(data);
    const body = await response.json();
    if (!response.ok) {
      alert(body.message || "Invalid credentials!");
      return;
    }
    localStorage.setItem("token", body.token);
    localStorage.setItem("userRole", "loggedPatient");
    window.location.href = "/pages/loggedPatientDashboard.html";
  } catch (error) {
    console.error("Patient login failed:", error);
    alert("Something went wrong. Please try again.");
  }
};

window.loadDoctorCards = loadDoctorCards;
window.renderDoctorCards = renderDoctorCards;
window.filterDoctorsOnChange = filterDoctorsOnChange;
