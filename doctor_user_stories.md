# Doctor User Stories

A doctor uses the portal to see who is coming in, to keep their availability accurate, and to
record prescriptions after a consultation.

---

**Title:**
_As a doctor, I want to log in to the portal with my email and password, so that I can reach my
own schedule._

**Acceptance Criteria:**
1. The login modal submits credentials to `POST /doctor/login`.
2. Valid credentials return a JWT token that identifies the doctor by email.
3. Invalid credentials return HTTP 401 and the doctor stays on the login screen.

**Priority:** High
**Story Points:** 3
**Notes:**
- The token is what authorises every later call, so a doctor can never read another doctor's schedule.

---

**Title:**
_As a doctor, I want to log out of the portal, so that my patient data is protected when I leave
the workstation._

**Acceptance Criteria:**
1. A "Logout" action is available on the doctor dashboard.
2. Logging out clears the stored token and returns to the home page.
3. Reopening `/doctorDashboard/{token}` with the discarded token redirects to the home page.

**Priority:** High
**Story Points:** 2

---

**Title:**
_As a doctor, I want to see my appointments for a chosen day, so that I know who I am seeing and
when._

**Acceptance Criteria:**
1. The dashboard has a date picker that defaults to today.
2. Choosing a date calls `GET /appointments/{date}/{patientName}/{token}` and lists the
   appointments for that day.
3. Each row shows the patient name, phone, email and the appointment time.

**Priority:** High
**Story Points:** 5
**Notes:**
- Only appointments belonging to the doctor identified by the token are returned.

---

**Title:**
_As a doctor, I want to search my appointments by patient name, so that I can find a specific
consultation quickly._

**Acceptance Criteria:**
1. A search box on the dashboard filters the day's appointments by patient name.
2. The search is case-insensitive and matches partial names.
3. Clearing the search box restores the full list for the selected date.

**Priority:** Medium
**Story Points:** 3

---

**Title:**
_As a doctor, I want to define the time slots I am available for, so that patients can only book
when I am actually free._

**Acceptance Criteria:**
1. A doctor's profile carries a list of slots in `HH:mm-HH:mm` format.
2. `GET /doctor/availability/{user}/{doctorId}/{date}/{token}` returns the published slots minus
   the ones already booked for that date.
3. A booking request for a time that is not in the available list is rejected.

**Priority:** High
**Story Points:** 5
**Notes:**
- Availability is computed on the fly by subtracting booked appointments from published slots,
  so it can never fall out of sync with the appointment table.

---

**Title:**
_As a doctor, I want to record a prescription for an appointment, so that the patient has a
written record of what was prescribed._

**Acceptance Criteria:**
1. Each appointment row offers an "Add Prescription" action.
2. Submitting the form calls `POST /prescription/{token}` with the patient name, medication,
   dosage and notes, and stores the prescription in MongoDB.
3. Saving a prescription marks the appointment as completed (status 1).
4. Trying to save a second prescription for the same appointment returns HTTP 400.

**Priority:** High
**Story Points:** 5
**Notes:**
- Prescriptions are documents rather than rows because their shape varies between cases.
