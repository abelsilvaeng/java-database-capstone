# Smart Clinic — Database Schema Design

The Smart Clinic stores its data in two engines, and the split is deliberate rather than
decorative. Anything that is naturally a row with fixed columns and hard relationships lives in
MySQL. Anything that is naturally a document — variable shape, nested lists, fields that only
some records have — lives in MongoDB.

## MySQL Database Design

MySQL holds the core operational entities: `patient`, `doctor`, `admin` and `appointment`.
These are stable, highly relational, and benefit from foreign keys, uniqueness constraints and
transactions. An appointment without a valid doctor and patient is meaningless, and the database
itself should be the thing that guarantees it.

### Table: patient

| Column   | Type         | Constraints                       |
|----------|--------------|-----------------------------------|
| id       | BIGINT       | PRIMARY KEY, AUTO_INCREMENT       |
| name     | VARCHAR(100) | NOT NULL, length 3–100            |
| email    | VARCHAR(255) | NOT NULL, UNIQUE                  |
| password | VARCHAR(255) | NOT NULL, minimum 6 characters    |
| phone    | VARCHAR(10)  | NOT NULL, UNIQUE, exactly 10 digits |
| address  | VARCHAR(255) | NOT NULL                          |

Email and phone are both unique because the signup flow rejects a patient whose email *or* phone
already exists. The password is never serialized back to the client.

### Table: doctor

| Column    | Type         | Constraints                    |
|-----------|--------------|--------------------------------|
| id        | BIGINT       | PRIMARY KEY, AUTO_INCREMENT    |
| name      | VARCHAR(100) | NOT NULL, length 3–100         |
| specialty | VARCHAR(50)  | NOT NULL, length 3–50          |
| email     | VARCHAR(255) | NOT NULL, UNIQUE               |
| password  | VARCHAR(255) | NOT NULL, minimum 6 characters |
| phone     | VARCHAR(10)  | NOT NULL, exactly 10 digits    |

### Table: doctor_available_times

A doctor publishes several time slots, so the slots live in their own table rather than as a
comma-separated string. This is what JPA generates for the `@ElementCollection` on
`Doctor.availableTimes`.

| Column          | Type        | Constraints                          |
|-----------------|-------------|--------------------------------------|
| doctor_id       | BIGINT      | NOT NULL, FOREIGN KEY → doctor(id)  |
| available_times | VARCHAR(50) | slot in `HH:mm-HH:mm` format         |

Deleting a doctor deletes their slots, since a slot has no meaning on its own.

### Table: appointment

| Column           | Type     | Constraints                           |
|------------------|----------|---------------------------------------|
| id               | BIGINT   | PRIMARY KEY, AUTO_INCREMENT           |
| doctor_id        | BIGINT   | NOT NULL, FOREIGN KEY → doctor(id)   |
| patient_id       | BIGINT   | NOT NULL, FOREIGN KEY → patient(id)  |
| appointment_time | DATETIME | NOT NULL, must be in the future       |
| status           | INT      | NOT NULL — 0 = scheduled, 1 = completed |

An appointment is treated as one hour long; the end time is derived as `appointment_time + 1
hour` rather than stored, so the two values can never disagree.

**On deletes.** When a doctor is removed from the roster, their appointments are removed with
them — an appointment pointing at a doctor who no longer exists is not useful to anyone, and
`deleteAllByDoctorId` runs in the same transaction as the doctor delete. Patients are kept even
when they have no appointments left, because the patient account outlives any individual visit.

**On overlapping bookings.** The application layer refuses a booking whose start time is not in
the doctor's remaining available slots, which is what prevents two patients from taking the same
hour. Availability is computed as *published slots minus booked slots* on every request, so it
cannot drift out of sync with the appointment table.

### Table: admin

| Column   | Type         | Constraints                 |
|----------|--------------|-----------------------------|
| id       | BIGINT       | PRIMARY KEY, AUTO_INCREMENT |
| username | VARCHAR(100) | NOT NULL, UNIQUE            |
| password | VARCHAR(255) | NOT NULL                    |

Admins log in by username rather than email, which is why the JWT subject for an admin holds the
username while for doctors and patients it holds the email.

## MongoDB Collection Design

MongoDB holds `prescriptions`. A prescription is exactly the kind of record that resists a fixed
schema: some carry refill instructions, some carry a pharmacy, some carry several medications,
and the fields the clinic wants to record will keep changing. Storing it as a document means the
shape can evolve without a migration on every table.

The document keeps `appointmentId` as a plain number pointing back at the MySQL `appointment`
row. There is no cross-database foreign key — the link is maintained by the service layer, which
is the deliberate trade-off for keeping the two stores independent.

### Collection: prescriptions

```json
{
  "_id": "665f1c2b9ab3f10e4c7d8a91",
  "patientName": "Maria Silva",
  "appointmentId": 51,
  "medication": "Amoxicillin",
  "dosage": "500mg",
  "doctorNotes": "Take one capsule every 8 hours for 7 days. Complete the full course.",
  "refillCount": 2,
  "pharmacy": {
    "name": "Downtown Pharmacy",
    "location": "742 Evergreen Ave"
  },
  "tags": ["antibiotic", "oral"],
  "createdAt": "2026-09-02T14:30:00Z"
}
```

`patientName`, `appointmentId`, `medication` and `dosage` are required and validated by the
model; `doctorNotes` is optional and capped at 200 characters. The remaining fields —
`refillCount`, `pharmacy`, `tags`, `createdAt` — show the flexibility the document model buys:
they can be present on some prescriptions and absent on others without breaking anything, and a
new field can be added tomorrow without touching the existing documents.

The service layer enforces one prescription per appointment: `findByAppointmentId` is checked
before an insert, and a second prescription for the same appointment is rejected with HTTP 400.
