/* addPrescription.js - the form a doctor fills in after a consultation. */

import { savePrescription, getPrescription } from "./services/prescriptionServices.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const appointmentId = params.get("appointmentId");
  const patientName = params.get("patientName") || "";
  const token = params.get("token") || localStorage.getItem("token");

  const nameField = document.getElementById("patientName");
  if (nameField) nameField.value = patientName;

  // If this appointment already has a prescription, show it instead of an empty form.
  if (appointmentId) {
    const existing = await getPrescription(appointmentId, token);
    const entry = Array.isArray(existing) ? existing[0] : existing;
    if (entry) {
      document.getElementById("medicines").value = entry.medication || "";
      document.getElementById("dosage").value = entry.dosage || "";
      document.getElementById("notes").value = entry.doctorNotes || "";
    }
  }

  const saveBtn = document.getElementById("savePrescription");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const prescription = {
        patientName: document.getElementById("patientName").value.trim(),
        appointmentId: Number(appointmentId),
        medication: document.getElementById("medicines").value.trim(),
        dosage: document.getElementById("dosage").value.trim(),
        doctorNotes: document.getElementById("notes").value.trim()
      };

      const result = await savePrescription(prescription, token);
      alert(result.message);
      if (result.success) {
        window.location.href = `/doctorDashboard/${token}`;
      }
    });
  }

  const cancelBtn = document.getElementById("cancelPrescription");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = `/doctorDashboard/${token}`;
    });
  }
});
