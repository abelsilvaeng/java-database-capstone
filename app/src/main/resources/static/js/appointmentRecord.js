/* appointmentRecord.js - read-only view of one appointment, used from the record page. */

import { getAllAppointments } from "./services/appointmentRecordService.js";

export async function loadAppointmentRecord(date, patientName) {
  const token = localStorage.getItem("token");
  const data = await getAllAppointments(date, patientName, token);
  return data.appointments || [];
}

window.loadAppointmentRecord = loadAppointmentRecord;
