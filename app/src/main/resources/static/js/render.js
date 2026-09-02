/* render.js - page bootstrap and role routing. */

function renderContent() {
  if (typeof renderHeader === "function") renderHeader();
  if (typeof renderFooter === "function") renderFooter();
}

/**
 * Sends the user to the right landing page for a role. Admin and doctor need a
 * token in the URL because their dashboards are server-rendered and validate it.
 */
function selectRole(role) {
  const token = localStorage.getItem("token");
  localStorage.setItem("userRole", role);

  if (role === "admin" && token) {
    window.location.href = `/adminDashboard/${token}`;
  } else if (role === "doctor" && token) {
    window.location.href = `/doctorDashboard/${token}`;
  } else if (role === "loggedPatient" && token) {
    window.location.href = "/pages/loggedPatientDashboard.html";
  } else if (role === "patient") {
    window.location.href = "/pages/patientDashboard.html";
  }
}

window.renderContent = renderContent;
window.selectRole = selectRole;
