# Reflection - Smart Clinic Management System

## What was built

A three-tier Spring Boot application for an outpatient clinic, covering all six capstone modules:
the architecture document and user stories, the dual-database design, the JPA and MongoDB models
with validation, the SQL schema with sample data and stored procedures, the Thymeleaf dashboards
and REST APIs with JWT authentication, and the Docker and GitHub Actions setup.

## Decisions worth recording

**Two databases, on purpose.** MySQL holds patients, doctors, admins and appointments, where
foreign keys and constraints are an asset. MongoDB holds prescriptions, which vary in shape from
case to case. The link between them is `appointmentId`, maintained by the service layer rather
than by a foreign key - that is the price of keeping the two stores independent, and it is worth
paying here because prescriptions are read through the appointment they belong to and never
joined in bulk.

**Availability is computed, never stored.** A doctor publishes slots; the free slots for a date
are those minus the appointments already booked. Nothing has to be kept in sync, so nothing can
drift out of sync. Booking validates against that same computation, which is what stops two
patients taking the same hour.

**Both controller styles delegate to one service layer.** The Thymeleaf dashboards and the REST
endpoints share the same business logic, so an authorisation rule or a booking check written once
applies to both. This was the single decision that kept the codebase from splitting in two.

**Tokens are checked against the database, not just verified.** A JWT is only accepted if the
identity it carries still exists for the claimed role. A token belonging to a deleted doctor stops
working immediately, without any revocation list.

## What was harder than expected

Deserialising an appointment was the subtlest bug risk. The browser posts `{"doctor": {"id": 1}}`,
which Jackson turns into a `Doctor` object holding nothing but an id. Passing that straight to
`save()` works by accident at best. The service now resolves both references to managed entities
before persisting.

The other one was ordering the request-mapping paths so that `/patient/{token}` and
`/patient/{id}/{token}` do not collide, and so that `/patient/login` is not swallowed by the
single-segment pattern. Distinct segment counts and HTTP methods resolve it, but it is the kind of
thing that only shows up when a route silently returns the wrong thing.

## What CI actually verifies

The pipeline is not decorative. The CI job starts real MySQL and MongoDB containers, loads
`cms.sql`, the sample data and the stored procedures, calls one of the procedures to prove it
compiles and runs, then runs the test suite against both live databases and builds the Docker
image. Lint runs ESLint over the frontend, and the security workflow scans dependencies for
critical vulnerabilities and refuses any commit that looks like it carries a credential.

## What I would do next

- Hash passwords with BCrypt instead of comparing them in plain text. The current behaviour
  matches the course scaffold, but it is the first thing that would have to change before this
  saw a real patient.
- Add integration tests for the controllers, not only unit tests for the models and filters.
- Move the appointment/slot check into a database constraint as well, so concurrent bookings
  cannot slip past the application-level check.
