# Patient User Stories

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
2. Server-side validation enforces name 3–100 chars, a valid email, password ≥ 6 chars, phone
   exactly 10 digits and address ≤ 255 chars.
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
