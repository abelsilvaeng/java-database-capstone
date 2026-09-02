/* doctorServices.js - every call the frontend makes against /doctor. */

import { API_BASE_URL } from "../config/config.js";

const DOCTOR_API = `${API_BASE_URL}/doctor`;

export async function getDoctors() {
  try {
    const response = await fetch(DOCTOR_API);
    const data = await response.json();
    return data.doctors || [];
  } catch (error) {
    console.error("Failed to load doctors:", error);
    return [];
  }
}

export async function deleteDoctor(id, token) {
  try {
    const response = await fetch(`${DOCTOR_API}/${id}/${token}`, { method: "DELETE" });
    const data = await response.json();
    return { success: response.ok, message: data.message };
  } catch (error) {
    console.error("Failed to delete doctor:", error);
    return { success: false, message: "Something went wrong while deleting the doctor." };
  }
}

export async function saveDoctor(doctor, token) {
  try {
    const response = await fetch(`${DOCTOR_API}/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doctor)
    });
    const data = await response.json();
    return { success: response.ok, message: data.message };
  } catch (error) {
    console.error("Failed to save doctor:", error);
    return { success: false, message: "Something went wrong while saving the doctor." };
  }
}

/**
 * The API takes all three filters as path segments, so an empty filter is sent as
 * the literal "null" and treated as "not provided" by the backend.
 */
export async function filterDoctors(name, time, specialty) {
  const segment = (value) => (value && value.trim() !== "" ? encodeURIComponent(value) : "null");
  try {
    const response = await fetch(
      `${DOCTOR_API}/filter/${segment(name)}/${segment(time)}/${segment(specialty)}`
    );
    if (!response.ok) {
      console.error("Filter request failed with status", response.status);
      return { doctors: [] };
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to filter doctors:", error);
    return { doctors: [] };
  }
}

export async function getDoctorAvailability(user, doctorId, date, token) {
  try {
    const response = await fetch(`${DOCTOR_API}/availability/${user}/${doctorId}/${date}/${token}`);
    const data = await response.json();
    return data.availableTimes || [];
  } catch (error) {
    console.error("Failed to load availability:", error);
    return [];
  }
}
