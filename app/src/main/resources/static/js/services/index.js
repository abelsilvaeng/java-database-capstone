/* index.js - role selection page: opens the login modals and handles admin/doctor login. */

import { openModal } from "../components/modals.js";
import { API_BASE_URL } from "../config/config.js";

const ADMIN_API = `${API_BASE_URL}/admin`;
const DOCTOR_API = `${API_BASE_URL}/doctor/login`;

window.openModal = openModal;

window.onload = function () {
  const adminBtn = document.getElementById("adminLogin");
  const doctorBtn = document.getElementById("doctorLogin");
  const patientBtn = document.getElementById("patientLogin");

  if (adminBtn) adminBtn.addEventListener("click", () => openModal("adminLogin"));
  if (doctorBtn) doctorBtn.addEventListener("click", () => openModal("doctorLogin"));
  if (patientBtn) patientBtn.addEventListener("click", () => selectRole("patient"));
};

window.adminLoginHandler = async function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(ADMIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      alert("Invalid credentials!");
      return;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    selectRole("admin");
  } catch (error) {
    console.error("Admin login failed:", error);
    alert("Something went wrong. Please try again.");
  }
};

window.doctorLoginHandler = async function () {
  const email = document.getElementById("doctorEmail").value.trim();
  const password = document.getElementById("doctorPassword").value;

  try {
    const response = await fetch(DOCTOR_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      alert("Invalid credentials!");
      return;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    selectRole("doctor");
  } catch (error) {
    console.error("Doctor login failed:", error);
    alert("Something went wrong. Please try again.");
  }
};
