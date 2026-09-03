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

---

**Title:**
_As a doctor, I want to mark my unavailability, so that patients are only shown the slots I can
actually attend._

**Acceptance Criteria:**
1. A doctor can remove a published slot from their profile, or block a slot for a given date.
2. Once a slot is marked unavailable, it stops appearing in
   `GET /doctor/availability/{user}/{doctorId}/{date}/{token}`.
3. A booking request for a slot that was marked unavailable is rejected with HTTP 400.

**Priority:** High
**Story Points:** 5
**Notes:**
- Unavailability is the mirror of availability: the API returns published slots minus booked
  ones, so removing a slot from `availableTimes` immediately hides it from patients.

---

**Title:**
_As a doctor, I want to update my profile with my specialization and contact information, so that
patients always see up-to-date details._

**Acceptance Criteria:**
1. The profile form lets the doctor change name, specialty, email, phone and available times.
2. Saving calls `PUT /doctor/{token}` and the updated details appear in `GET /doctor` right away.
3. Updating a doctor id that does not exist returns HTTP 404, and invalid values (phone not 10
   digits, malformed email, specialty shorter than 3 characters) return HTTP 400.

**Priority:** Medium
**Story Points:** 3
**Notes:**
- The same validation rules that apply when an admin creates a doctor apply to updates.

---

**Title:**
_As a doctor, I want to view the patient details for my upcoming appointments, so that I can be
prepared before each consultation._

**Acceptance Criteria:**
1. Each appointment row on the doctor dashboard shows the patient id, name, phone and email.
2. The details come from `GET /appointments/{date}/{patientName}/{token}` and are limited to the
   appointments belonging to the doctor the token identifies.
3. A doctor cannot see the details of a patient who has no appointment with them.

**Priority:** High
**Story Points:** 3
**Notes:**
- Patient passwords are never serialized, so they cannot leak through this view.
