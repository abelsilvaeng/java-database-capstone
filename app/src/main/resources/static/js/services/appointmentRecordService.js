/* appointmentRecordService.js - booking, updating and reading appointments. */

import { API_BASE_URL } from "../config/config.js";

const APPOINTMENT_API = `${API_BASE_URL}/appointments`;

/** Appointments for one doctor on one date, optionally narrowed by patient name. */
export async function getAllAppointments(date, patientName, token) {
  const name = patientName && patientName.trim() !== "" ? encodeURIComponent(patientName) : "null";
  try {
    const response = await fetch(`${APPOINTMENT_API}/${date}/${name}/${token}`);
    if (!response.ok) {
      console.error("Failed to fetch appointments, status", response.status);
      return { appointments: [] };
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return { appointments: [] };
  }
}

export async function bookAppointment(appointment, token) {
  try {
    const response = await fetch(`${APPOINTMENT_API}/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment)
    });
    const data = await response.json();
    return { success: response.ok, message: data.message };
  } catch (error) {
    console.error("Failed to book appointment:", error);
    return { success: false, message: "Something went wrong while booking." };
  }
}

export async function updateAppointment(appointment, token) {
  try {
    const response = await fetch(`${APPOINTMENT_API}/${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment)
    });
    const data = await response.json();
    return { success: response.ok, message: data.message };
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return { success: false, message: "Something went wrong while updating." };
  }
}

export async function cancelAppointment(id, token) {
  try {
    const response = await fetch(`${APPOINTMENT_API}/${id}/${token}`, { method: "DELETE" });
    const data = await response.json();
    return { success: response.ok, message: data.message };
  } catch (error) {
    console.error("Failed to cancel appointment:", error);
    return { success: false, message: "Something went wrong while cancelling." };
  }
}
