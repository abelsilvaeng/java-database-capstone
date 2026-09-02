# Admin User Stories

The admin is the operational owner of the clinic portal. Admins do not book or attend
appointments — they manage who is allowed into the system and keep the doctor roster accurate.

---

**Title:**
_As an admin, I want to log into the portal with my username and password, so that I can manage
the platform securely._

**Acceptance Criteria:**
1. The login page accepts a username and a password and submits them to `POST /admin`.
2. Valid credentials return a JWT token, which the frontend stores and uses for later requests.
3. Invalid credentials return HTTP 401 with a clear message and no token.

**Priority:** High
**Story Points:** 3
**Notes:**
- The token is valid for seven days; after that the admin has to log in again.

---

**Title:**
_As an admin, I want to log out of the portal, so that my session cannot be reused on a shared
computer._

**Acceptance Criteria:**
1. A "Logout" action is visible on every admin screen.
2. Logging out removes the stored token from the browser.
3. After logging out, opening `/adminDashboard/{token}` with the old token redirects to the home page.

**Priority:** High
**Story Points:** 2
**Notes:**
- Tokens are stateless, so logout is enforced by discarding the token client-side and by the
  server rejecting tokens whose identity no longer exists.

---

**Title:**
_As an admin, I want to add a new doctor to the portal, so that patients can start booking
appointments with them._

**Acceptance Criteria:**
1. The admin dashboard offers an "Add Doctor" form with name, specialty, email, password, phone
   and available time slots.
2. Submitting the form calls `POST /doctor/{token}` and the doctor appears in the doctor list.
3. Submitting an email that already belongs to a doctor returns HTTP 409 and no duplicate is created.

**Priority:** High
**Story Points:** 5
**Notes:**
- All field validations (name 3–100 chars, valid email, password ≥ 6 chars, phone exactly
  10 digits) are enforced on the server, not only in the browser.

---

**Title:**
_As an admin, I want to delete a doctor's profile from the portal, so that the roster reflects
who actually works at the clinic._

**Acceptance Criteria:**
1. Each row in the doctor list has a delete action guarded by a confirmation.
2. Deleting calls `DELETE /doctor/{id}/{token}` and removes the doctor.
3. All appointments belonging to that doctor are deleted in the same operation, so no appointment
   is left pointing at a doctor who no longer exists.

**Priority:** Medium
**Story Points:** 3
**Notes:**
- Deletion requires a valid admin token; a doctor or patient token is rejected with HTTP 401.

---

**Title:**
_As an admin, I want to run a stored procedure that reports the number of appointments per month,
so that I can track how busy the clinic is over time._

**Acceptance Criteria:**
1. Running `CALL get_monthly_appointment_report_by_doctor(...)` in MySQL returns one row per
   doctor and month with the appointment count.
2. The report is derived from live appointment data, not from a manually maintained table.
3. The procedure is stored in the repository so it can be recreated on any environment.

**Priority:** Medium
**Story Points:** 3
**Notes:**
- Reporting procedures live in `SQL/stored-procedures.sql`.

---

**Title:**
_As an admin, I want to see the full list of registered doctors on my dashboard, so that I can
review the roster at a glance._

**Acceptance Criteria:**
1. Opening `/adminDashboard/{token}` with a valid admin token loads the dashboard.
2. The dashboard calls `GET /doctor` and renders one card per doctor with name, specialty, email
   and available times.
3. Opening the dashboard with an invalid or expired token redirects to the home page instead of
   showing any data.

**Priority:** High
**Story Points:** 3
