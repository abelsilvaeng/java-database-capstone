/* modals.js - one modal element per page, filled with whichever form was asked for. */

export function openModal(type) {
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  if (!modal || !modalBody) return;

  modalBody.innerHTML = modalContent(type);
  modal.style.display = "block";

  const closeBtn = document.getElementById("closeModal");
  if (closeBtn) closeBtn.onclick = () => (modal.style.display = "none");

  wireSubmit(type);
}

function modalContent(type) {
  switch (type) {
    case "adminLogin":
      return `
        <h2>Admin Login</h2>
        <input type="text" id="username" class="input-field" placeholder="Username">
        <input type="password" id="password" class="input-field" placeholder="Password">
        <button class="dashboard-btn" id="adminLoginSubmit">Login</button>`;

    case "doctorLogin":
      return `
        <h2>Doctor Login</h2>
        <input type="email" id="doctorEmail" class="input-field" placeholder="Email">
        <input type="password" id="doctorPassword" class="input-field" placeholder="Password">
        <button class="dashboard-btn" id="doctorLoginSubmit">Login</button>`;

    case "patientLogin":
      return `
        <h2>Patient Login</h2>
        <input type="email" id="email" class="input-field" placeholder="Email">
        <input type="password" id="password" class="input-field" placeholder="Password">
        <button class="dashboard-btn" id="loginBtn">Login</button>`;

    case "patientSignup":
      return `
        <h2>Patient Sign Up</h2>
        <input type="text" id="name" class="input-field" placeholder="Full name">
        <input type="email" id="email" class="input-field" placeholder="Email">
        <input type="password" id="password" class="input-field" placeholder="Password (min 6 chars)">
        <input type="text" id="phone" class="input-field" placeholder="Phone (10 digits)">
        <input type="text" id="address" class="input-field" placeholder="Address">
        <button class="dashboard-btn" id="signupBtn">Sign Up</button>`;

    case "addDoctor":
      return `
        <h2>Add Doctor</h2>
        <input type="text" id="doctorName" class="input-field" placeholder="Doctor name">
        <select id="specialization" class="input-field select-dropdown">
          <option value="">Specialization</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Neurology">Neurology</option>
        </select>
        <input type="email" id="doctorEmail" class="input-field" placeholder="Email">
        <input type="password" id="doctorPassword" class="input-field" placeholder="Password (min 6 chars)">
        <input type="text" id="doctorPhone" class="input-field" placeholder="Phone (10 digits)">
        <div class="availability-container">
          <label class="availabilityLabel">Available time slots:</label>
          <div class="checkbox-group">
            <label><input type="checkbox" name="availability" value="09:00-10:00"> 09:00-10:00</label>
            <label><input type="checkbox" name="availability" value="10:00-11:00"> 10:00-11:00</label>
            <label><input type="checkbox" name="availability" value="11:00-12:00"> 11:00-12:00</label>
            <label><input type="checkbox" name="availability" value="13:00-14:00"> 13:00-14:00</label>
            <label><input type="checkbox" name="availability" value="14:00-15:00"> 14:00-15:00</label>
            <label><input type="checkbox" name="availability" value="15:00-16:00"> 15:00-16:00</label>
          </div>
        </div>
        <button class="dashboard-btn" id="saveDoctorBtn">Save</button>`;

    default:
      return "<p>Nothing to show.</p>";
  }
}

/** Each form calls a handler defined by the page or service that owns it. */
function wireSubmit(type) {
  const bind = (id, handlerName) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        if (typeof window[handlerName] === "function") window[handlerName]();
      });
    }
  };

  bind("adminLoginSubmit", "adminLoginHandler");
  bind("doctorLoginSubmit", "doctorLoginHandler");
  bind("loginBtn", "loginPatient");
  bind("signupBtn", "signupPatient");
  bind("saveDoctorBtn", "adminAddDoctor");
}

window.openModal = openModal;
