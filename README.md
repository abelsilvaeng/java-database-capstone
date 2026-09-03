# Smart Clinic Management System

Capstone project for the IBM **Java Development Capstone Project** course. It is a full-stack
outpatient clinic portal: a Spring Boot backend serving both server-rendered Thymeleaf dashboards
and JSON REST APIs, backed by MySQL for relational data and MongoDB for prescriptions, packaged
with Docker and built by GitHub Actions.

## What it does

| Role | What they can do |
|------|------------------|
| **Admin** | Log in, see the doctor roster, add a doctor with their available slots, delete a doctor (and their appointments), run reporting stored procedures |
| **Doctor** | Log in, see their appointments for any date, search by patient name, write a prescription for a visit |
| **Patient** | Browse doctors without an account, sign up, log in, book an hour-long slot, reschedule, cancel, filter past and upcoming visits, view their medical record |

## Architecture at a glance

```
Browser / API client
        |
        v
Controllers  --  @Controller (Thymeleaf dashboards)  +  @RestController (JSON APIs)
        |
        v
Service layer  --  business rules, token validation, availability checks
        |
        v
Repositories  --  Spring Data JPA  +  Spring Data MongoDB
        |
        v
   MySQL (cms)          MongoDB (prescriptions)
```

Two documents go into more detail:

- [`schema-architecture.md`](schema-architecture.md) - the three-tier design and the seven-step
  request/response flow.
- [`schema-design.md`](schema-design.md) - every table and the prescription document, with the
  reasoning behind the relational/document split.

## Repository layout

```
.
├── schema-architecture.md            Architecture design document (Module 1)
├── admin_user_stories.md             User stories per role (Module 1)
├── doctor_user_stories.md
├── patient_user_stories.md
├── schema-design.md                  Database design (Module 2)
├── SQL/
│   ├── cms.sql                       MySQL schema (Module 3)
│   ├── insert-sample-data.sql        Sample admins, doctors, patients, appointments
│   └── stored-procedures.sql         Reporting procedures
├── prescriptions/
│   └── load-prescriptions.js         mongosh seed for 24 prescriptions
├── app/
│   ├── Dockerfile                    Multi-stage build, non-root runtime (Module 5)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/project/back_end/
│       │   ├── models/               JPA entities and the MongoDB document (Module 2)
│       │   ├── repo/                 Spring Data repositories
│       │   ├── services/             Business logic, JWT, filters
│       │   ├── controllers/          REST endpoints (Module 5)
│       │   ├── mvc/                  Thymeleaf dashboard controller (Module 4)
│       │   ├── DTO/
│       │   └── config/
│       └── resources/
│           ├── templates/            Admin and doctor dashboards
│           └── static/               Public pages, CSS and JavaScript (Module 4)
├── docker-compose.yml                App + MySQL + MongoDB
└── .github/workflows/                CI, lint and security pipelines (Module 5)
```

## Running it

### With Docker (everything at once)

```bash
docker compose up --build
```

This builds the application image, starts MySQL and MongoDB, loads the schema, the sample data and
the stored procedures on first start, seeds the prescription documents, and serves the portal on
<http://localhost:8080>.

### Locally, against your own databases

```bash
# 1. Prepare MySQL
mysql -u root -p < SQL/cms.sql
mysql -u root -p < SQL/insert-sample-data.sql
mysql -u root -p < SQL/stored-procedures.sql

# 2. Prepare MongoDB
mongosh "mongodb://localhost:27017/prescriptions" prescriptions/load-prescriptions.js
# With an authenticated instance, add the credentials and authSource:
#   mongosh "mongodb://root:<password>@<host>:27017/prescriptions?authSource=admin" #     prescriptions/load-prescriptions.js

# 3. Run the app
cd app
./mvnw spring-boot:run
```

Configuration is read from the environment, with local defaults baked in:

| Variable | Default | Meaning |
|----------|---------|---------|
| `MYSQL_HOST` | `localhost` | MySQL host |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_DB` | `cms` | MySQL database name |
| `MYSQL_USER` | `root` | MySQL user |
| `MYSQL_PASSWORD` | `root` | MySQL password |
| `MONGO_URI` | `mongodb://localhost:27017/prescriptions` | MongoDB connection string |
| `JWT_SECRET` | development value | HMAC key used to sign tokens |

**Set a real `JWT_SECRET` before deploying anywhere.** The default exists so the project runs out
of the box, not because it is safe.

### Sample logins

From `SQL/insert-sample-data.sql`:

| Role | Identifier | Password |
|------|-----------|----------|
| Admin | `admin` | `admin@1234` |
| Doctor | `dr.adams@example.com` | `pass12345` |
| Patient | `jane.doe@example.com` | `passJane1` |

The seed loads 25 doctors with 100 availability slots, 25 patients, 130 appointments
(50 scheduled, 80 completed), one admin, and 24 prescriptions in MongoDB.

## API

`api.path` is `/`, so the REST endpoints sit at the root.

### Admin
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/admin` | Admin login, returns a JWT |

### Doctors
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/doctor` | List every doctor (public) |
| POST | `/doctor/login` | Doctor login, returns a JWT |
| POST | `/doctor/{token}` | Add a doctor (admin token) |
| PUT | `/doctor/{token}` | Update a doctor (admin token) |
| DELETE | `/doctor/{id}/{token}` | Delete a doctor and their appointments (admin token) |
| GET | `/doctor/availability/{user}/{doctorId}/{date}/{token}` | Free slots for a date |
| GET | `/doctor/filter/{name}/{time}/{speciality}` | Filter doctors; pass `null` for any unused filter |

### Patients
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/patient` | Sign up |
| POST | `/patient/login` | Patient login, returns a JWT |
| GET | `/patient/{token}` | The logged-in patient's details |
| GET | `/patient/{id}/{token}` | That patient's appointments |
| GET | `/patient/filter/{condition}/{name}/{token}` | Filter by `past`/`future` and doctor name |

### Appointments
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/appointments/{date}/{patientName}/{token}` | A doctor's appointments for a date |
| POST | `/appointments/{token}` | Book (patient token) |
| PUT | `/appointments/{token}` | Reschedule (patient token) |
| DELETE | `/appointments/{id}/{token}` | Cancel (patient token) |

### Prescriptions
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/prescription/{token}` | Save a prescription and mark the appointment completed (doctor token) |
| GET | `/prescription/{appointmentId}/{token}` | Read the prescription for an appointment (doctor token) |

### Dashboards (server-rendered)
| Path | View |
|------|------|
| `/adminDashboard/{token}` | Admin dashboard, redirects to `/` if the token is not a valid admin token |
| `/doctorDashboard/{token}` | Doctor dashboard, same guard for doctors |

## Authentication

Login returns a JWT signed with HMAC-SHA and valid for seven days. Its subject is the admin
username, or the doctor's or patient's email. Every protected route validates the token *and*
checks that the identity it carries still exists for the claimed role, so a token belonging to a
deleted user stops working immediately.

## Reporting

```sql
CALL GetDailyAppointmentReportByDoctor('2025-04-15');
CALL GetDoctorWithMostPatientsByMonth(4, 2025);
CALL GetDoctorWithMostPatientsByYear(2025);
CALL get_monthly_appointment_report_by_doctor(2025);   -- NULL for every year
```

The first three match the definitions given by the course lab; the fourth is an
extra report backing the admin user story about monthly appointment volume.

## Tests and CI

```bash
cd app
./mvnw test
```

Three GitHub Actions workflows run on every push and pull request:

- **CI** - starts MySQL and MongoDB as service containers, loads the schema, sample data and
  stored procedures, runs the full test suite, then builds the Docker image.
- **Lint** - ESLint over the frontend JavaScript, plus a Java compile and a Checkstyle report.
- **Security** - a Trivy scan for critical vulnerabilities and a check that no credentials were
  committed.
