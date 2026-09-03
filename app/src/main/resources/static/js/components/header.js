/* header.js - builds the site header and the role-specific actions inside it. */

function renderHeader() {
  const headerDiv = document.getElementById("header");
  if (!headerDiv) return;

  // The role picker itself never shows a session; landing there ends any session.
  if (window.location.pathname.endsWith("/") || window.location.pathname.endsWith("/index.html")) {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    headerDiv.innerHTML = baseHeader("");
    return;
  }

  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  // A signed-in role without a token means the session expired or was tampered with.
  if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
    localStorage.removeItem("userRole");
    alert("Session expired or invalid login. Please log in again.");
    window.location.href = "/";
    return;
  }

  let actions = "";
  if (role === "admin") {
    actions = `
      <button id="addDocBtn" class="adminBtn" onclick="openModal('addDoctor')">Add Doctor</button>
      <a href="#" onclick="logout()">Logout</a>`;
  } else if (role === "doctor") {
    actions = `
      <button class="adminBtn" onclick="selectRole('doctor')">Home</button>
      <a href="#" onclick="logout()">Logout</a>`;
  } else if (role === "loggedPatient") {
    actions = `
      <button id="home" class="adminBtn" onclick="window.location.href='/pages/loggedPatientDashboard.html'">Home</button>
      <button id="patientAppointments" class="adminBtn" onclick="window.location.href='/pages/patientAppointments.html'">Appointments</button>
      <a href="#" onclick="logoutPatient()">Logout</a>`;
  } else if (role === "patient") {
    actions = `
      <button id="patientLogin" class="adminBtn" onclick="openModal('patientLogin')">Login</button>
      <button id="patientSignup" class="adminBtn" onclick="openModal('patientSignup')">Sign Up</button>`;
  }

  headerDiv.innerHTML = baseHeader(actions);
}

function baseHeader(actions) {
  return `
    <header class="header">
      <div class="logo-section">
        <a href="/" class="logo-link">
          <img src="/assets/images/logo/logo.png" alt="Smart Clinic logo" class="logo-img">
          <span class="logo-title">Smart Clinic</span>
        </a>
      </div>
      <nav>${actions}</nav>
    </header>`;
}

window.renderHeader = renderHeader;
