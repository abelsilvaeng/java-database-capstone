/* util.js - small helpers shared by every page. Loaded with defer, not as a module,
   so everything here hangs off window. */

function setRole(role) {
  localStorage.setItem("userRole", role);
}

function getRole() {
  return localStorage.getItem("userRole");
}

function clearRole() {
  localStorage.removeItem("userRole");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function clearToken() {
  localStorage.removeItem("token");
}

/** Drops both the role and the token, then sends the user back to the role picker. */
function logout() {
  clearRole();
  clearToken();
  window.location.href = "/";
}

/** A patient stepping back to the public doctor list keeps nothing behind. */
function logoutPatient() {
  clearToken();
  setRole("patient");
  window.location.href = "/pages/patientDashboard.html";
}

/** "2026-09-10T14:00:00" -> "10/09/2026" */
function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date)) return value;
  return date.toLocaleDateString();
}

/** "2026-09-10T14:00:00" -> "14:00" */
function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date)) return value;
  return date.toTimeString().slice(0, 5);
}

/** Today as yyyy-mm-dd, the format the date inputs and the API both expect. */
function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function showMessage(message) {
  alert(message);
}

window.setRole = setRole;
window.getRole = getRole;
window.clearRole = clearRole;
window.setToken = setToken;
window.getToken = getToken;
window.clearToken = clearToken;
window.logout = logout;
window.logoutPatient = logoutPatient;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.todayISO = todayISO;
window.showMessage = showMessage;
