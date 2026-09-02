/* patientServices.js - signup, login and the patient's own appointment data. */

import { API_BASE_URL } from "../config/config.js";

const PATIENT_API = `${API_BASE_URL}/patient`;

export async function patientSignup(data) {
  try {
    const response = await fetch(PATIENT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    return { success: response.ok, message: result.message };
  } catch (error) {
    console.error("Signup failed:", error);
    return { success: false, message: "Something went wrong during signup." };
  }
}

export async function patientLogin(data) {
  return fetch(`${PATIENT_API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function getPatientData(token) {
  try {
    const response = await fetch(`${PATIENT_API}/${token}`);
    const data = await response.json();
    return response.ok ? data.patient : null;
  } catch (error) {
    console.error("Failed to load patient data:", error);
    return null;
  }
}

export async function getPatientAppointments(id, token) {
  try {
    const response = await fetch(`${PATIENT_API}/${id}/${token}`);
    const data = await response.json();
    return response.ok ? data.appointments : null;
  } catch (error) {
    console.error("Failed to load appointments:", error);
    return null;
  }
}

export async function filterAppointments(condition, name, token) {
  const segment = (value) => (value && value.trim() !== "" ? encodeURIComponent(value) : "null");
  try {
    const response = await fetch(
      `${PATIENT_API}/filter/${segment(condition)}/${segment(name)}/${token}`
    );
    if (!response.ok) {
      console.error("Filter request failed with status", response.status);
      return { appointments: [] };
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to filter appointments:", error);
    return { appointments: [] };
  }
}
