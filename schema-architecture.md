# Smart Clinic Management System — Architecture Design

## Section 1: Architecture Summary

The Smart Clinic Management System is a three-tier Spring Boot application that deliberately
mixes two presentation styles instead of committing to only one. The Admin and Doctor
dashboards are server-rendered with Thymeleaf, because those are internal, form-heavy screens
where a full page rendered by the server is the simplest thing that works. Every other module —
appointments, the patient dashboard, patient records and prescriptions — is exposed as a REST
API that returns JSON, so the same backend can serve the browser today and a mobile client or a
third-party integration later without rewriting the business logic. Both styles enter the
application through the controller layer: `@Controller` classes in the `mvc` package return
template names, `@RestController` classes in the `controllers` package return serialized objects.

What keeps the two styles from drifting apart is that neither controller type talks to a
database. Both delegate to a shared service layer, which is where the business rules actually
live: validating a login token, checking that a doctor is available before an appointment is
booked, filtering by date or specialty. The service layer then calls the repository layer, and
this is where the dual-database design becomes visible. Structured, relational data — patients,
doctors, appointments, admins — is persisted in MySQL through Spring Data JPA, where foreign
keys and constraints are an advantage. Prescriptions are persisted in MongoDB through Spring
Data MongoDB, because a prescription is a nested document whose shape varies from case to case
and benefits from schema flexibility. Data coming back from MySQL is bound to JPA entities
annotated with `@Entity`; data coming back from MongoDB is bound to document classes annotated
with `@Document`. From the service layer upward, both are just Java objects, so a single service
can combine relational and document data in one response without the controllers ever knowing
which database the data came from.

This separation is also what makes the system deployable. Because the layers only depend on the
interfaces below them, the application packages cleanly into a Docker image, runs alongside
MySQL and MongoDB containers, and can be built, tested and scanned automatically by a CI
pipeline before anything reaches the repository's main branch.

## Section 2: Numbered Flow of Data and Control

1. **User interface layer.** A request starts in one of two places: an admin or doctor opens a
   Thymeleaf dashboard (`AdminDashboard`, `DoctorDashboard`) in the browser, or an API client —
   the patient-facing JavaScript modules, a mobile app, or a tool such as Postman — issues an
   HTTP call against the REST endpoints for appointments, patient records or prescriptions.

2. **Controller layer.** Spring routes the request by URL path and HTTP method to the matching
   controller. Dashboard URLs reach a Thymeleaf `@Controller`, which will ultimately return the
   name of an HTML template; `/api/**` URLs reach a `@RestController`, which will return a JSON
   payload. Both perform request validation and, for protected routes, hand the incoming JWT to
   the token service before doing anything else.

3. **Service layer.** The controller does not implement business logic itself; it calls a
   service. The service layer applies the actual rules of the clinic — verifying that the token
   belongs to the claimed role, rejecting an appointment slot a doctor has already booked,
   assembling the doctor list for a given specialty and date. Because this logic sits in one
   place, both the MVC flow and the REST flow behave identically.

4. **Repository layer.** To read or write data, the service calls a repository interface rather
   than writing queries by hand. Spring Data generates the implementations at runtime: JPA
   repositories (`AdminRepository`, `DoctorRepository`, `PatientRepository`,
   `AppointmentRepository`) for relational data, and a Spring Data MongoDB repository
   (`PrescriptionRepository`) for prescription documents.

5. **Database access.** Each repository executes against its own engine. MySQL holds the
   normalized core entities — admins, doctors, patients and appointments — where referential
   integrity and constraints matter. MongoDB holds prescriptions in the `prescriptions`
   collection, where records are nested, optional fields are common, and the shape is expected
   to evolve.

6. **Model binding.** The rows and documents that come back are mapped into Java objects. MySQL
   result sets become JPA entities annotated with `@Entity`, each instance representing a table
   row with its relationships already resolved. MongoDB documents become classes annotated with
   `@Document`, mapped from BSON into ordinary Java fields. From here on, the rest of the
   application works with plain objects, not with SQL rows or BSON.

7. **Application models in use.** Finally the bound models are turned into a response. In the
   MVC flow, the controller places them into the `Model` and Thymeleaf renders a complete HTML
   page that is sent to the browser. In the REST flow, the same models — or the DTOs derived
   from them, such as `AppointmentDTO`, which flattens the entity into exactly the fields the
   client needs — are serialized to JSON by Jackson and returned in the HTTP response body. Either
   way, the request/response cycle ends and control returns to the user interface layer.
