/* prescriptionServices.js - prescriptions live in MongoDB behind /prescription. */

import { API_BASE_URL } from "../config/config.js";

const PRESCRIPTION_API = `${API_BASE_URL}/prescription`;

export async function savePrescription(prescription, token) {
  try {
    const response = await fetch(`${PRESCRIPTION_API}/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prescription)
    });
    const data = await response.json();
    return { success: response.ok, message: data.message };
  } catch (error) {
    console.error("Failed to save prescription:", error);
    return { success: false, message: "Something went wrong while saving the prescription." };
  }
}

export async function getPrescription(appointmentId, token) {
  try {
    const response = await fetch(`${PRESCRIPTION_API}/${appointmentId}/${token}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.prescription || null;
  } catch (error) {
    console.error("Failed to load prescription:", error);
    return null;
  }
}
