# User Story Template

**Title:**
_As a [user role], I want [feature/goal], so that [reason]._

**Acceptance Criteria:**
1. [Criteria 1]
2. [Criteria 2]
3. [Criteria 3]

**Priority:** [High/Medium/Low]
**Story Points:** [Estimated Effort in Points]
**Notes:**
- [Additional information or edge cases]

---

# User Stories - Smart Clinic Management System

This document collects the user stories for the Patient Appointment Portal, grouped by the three
roles that interact with the system: **Admin**, **Patient** and **Doctor**. Each story follows the
standard agile format and carries acceptance criteria, a priority and a story-point estimate.

Every story below is also tracked as a GitHub issue in this repository, labelled by role:
[admin](../../issues?q=is%3Aissue+label%3Aadmin) ·
[patient](../../issues?q=is%3Aissue+label%3Apatient) ·
[doctor](../../issues?q=is%3Aissue+label%3Adoctor)

The per-role breakdowns live in [`admin_user_stories.md`](admin_user_stories.md),
[`doctor_user_stories.md`](doctor_user_stories.md) and
[`patient_user_stories.md`](patient_user_stories.md).

---

## Admin User Stories

The admin is the operational owner of the clinic portal. Admins do not book or attend
appointments; they manage who is allowed into the system and keep the doctor roster accurate.

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
- All field validations (name 3-100 chars, valid email, password >= 6 chars, phone exactly
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

---

## Patient User Stories

A patient uses the portal to find a doctor, book a consultation, and keep track of past and
upcoming visits.

---

**Title:**
_As a patient, I want to browse the list of doctors without logging in, so that I can decide
whether the clinic is right for me before creating an account._

**Acceptance Criteria:**
1. The home page calls `GET /doctor` and shows every doctor without requiring a token.
2. Each card shows the doctor's name, specialty and available times.
3. Trying to book from this view prompts the visitor to log in or sign up first.

**Priority:** High
**Story Points:** 3

---

**Title:**
_As a patient, I want to sign up with my name, email, password, phone and address, so that I can
book appointments._

**Acceptance Criteria:**
1. The signup form submits to `POST /patient`.
2. Server-side validation enforces name 3-100 chars, a valid email, password >= 6 chars, phone
   exactly 10 digits and address <= 255 chars.
3. Signing up with an email or phone that already exists returns HTTP 409 and no duplicate record
   is created.

**Priority:** High
**Story Points:** 5

---

**Title:**
_As a patient, I want to log in to the portal, so that I can manage my own bookings._

**Acceptance Criteria:**
1. The login modal submits to `POST /patient/login`.
2. Valid credentials return a JWT token identifying the patient by email.
3. Invalid credentials return HTTP 401 with a message and no token.

**Priority:** High
**Story Points:** 3

---

**Title:**
_As a patient, I want to log out, so that nobody else can use my session._

**Acceptance Criteria:**
1. A "Logout" action is available once logged in.
2. Logging out clears the token from the browser and returns to the home page.
3. Protected endpoints reject the discarded token with HTTP 401.

**Priority:** High
**Story Points:** 2

---

**Title:**
_As a patient, I want to book an hour-long appointment with a doctor of my choice, so that I can
be seen at a time that works for me._

**Acceptance Criteria:**
1. Selecting a doctor and a date shows only the slots that doctor still has free.
2. Confirming calls `POST /appointments/{token}` and creates the appointment with status 0.
3. Booking a slot that is already taken, or a time the doctor does not publish, returns HTTP 400
   with an explanatory message.

**Priority:** High
**Story Points:** 8
**Notes:**
- Each appointment is treated as one hour: the end time is derived as start + 1 hour.

---

**Title:**
_As a patient, I want to see my upcoming appointments, so that I can prepare for them._

**Acceptance Criteria:**
1. The patient dashboard calls `GET /patient/{id}/{token}` and lists the patient's appointments.
2. Filtering by `future` returns only appointments with status 0, ordered by time.
3. The list shows the doctor name, date and time for each appointment.

**Priority:** High
**Story Points:** 5

---

**Title:**
_As a patient, I want to filter my appointment history by doctor name and by past or future, so
that I can find a specific visit._

**Acceptance Criteria:**
1. `GET /patient/filter/{condition}/{name}/{token}` accepts `past`, `future`, a doctor name, or
   both together.
2. An unrecognised condition returns HTTP 400 rather than an empty list.
3. Filters combine: a doctor name plus `past` returns only completed visits with that doctor.

**Priority:** Medium
**Story Points:** 5

---

**Title:**
_As a patient, I want to cancel an appointment I no longer need, so that the slot is freed for
someone else._

**Acceptance Criteria:**
1. Each upcoming appointment offers a cancel action.
2. Cancelling calls `DELETE /appointments/{id}/{token}` and removes the appointment.
3. A patient can only cancel their own appointments; anyone else's returns HTTP 401.

**Priority:** Medium
**Story Points:** 3

---

## Doctor User Stories

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
