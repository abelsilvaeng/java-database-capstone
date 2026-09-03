-- =====================================================================
-- Smart Clinic Management System - stored procedures
-- Run after SQL/insert-sample-data.sql.
--
-- The first three procedures are the ones defined by the "Adding Stored
-- Procedures" lab, reproduced exactly so their output matches what the
-- assignment expects. The fourth is an extra report used by the admin
-- user story about monthly appointment volume.
-- =====================================================================

USE cms;

DROP PROCEDURE IF EXISTS GetDailyAppointmentReportByDoctor;
DROP PROCEDURE IF EXISTS GetDoctorWithMostPatientsByMonth;
DROP PROCEDURE IF EXISTS GetDoctorWithMostPatientsByYear;
DROP PROCEDURE IF EXISTS get_monthly_appointment_report_by_doctor;

DELIMITER $

-- ---------------------------------------------------------------------
-- Every appointment on a given date, grouped by doctor.
-- Usage: CALL GetDailyAppointmentReportByDoctor('2025-04-15');
-- ---------------------------------------------------------------------
CREATE PROCEDURE GetDailyAppointmentReportByDoctor(
    IN report_date DATE
)
BEGIN
    SELECT
        d.name AS doctor_name,
        a.appointment_time,
        a.status,
        p.name AS patient_name,
        p.phone AS patient_phone
    FROM
        appointment a
    JOIN
        doctor d ON a.doctor_id = d.id
    JOIN
        patient p ON a.patient_id = p.id
    WHERE
        DATE(a.appointment_time) = report_date
    ORDER BY
        d.name, a.appointment_time;
END$

-- ---------------------------------------------------------------------
-- The doctor who saw the most patients in a given month.
-- Usage: CALL GetDoctorWithMostPatientsByMonth(4, 2025);
-- ---------------------------------------------------------------------
CREATE PROCEDURE GetDoctorWithMostPatientsByMonth(
    IN input_month INT,
    IN input_year INT
)
BEGIN
    SELECT
        doctor_id,
        COUNT(patient_id) AS patients_seen
    FROM
        appointment
    WHERE
        MONTH(appointment_time) = input_month
        AND YEAR(appointment_time) = input_year
    GROUP BY
        doctor_id
    ORDER BY
        patients_seen DESC
    LIMIT 1;
END$

-- ---------------------------------------------------------------------
-- The doctor who saw the most patients across a whole year.
-- Usage: CALL GetDoctorWithMostPatientsByYear(2025);
-- ---------------------------------------------------------------------
CREATE PROCEDURE GetDoctorWithMostPatientsByYear(
    IN input_year INT
)
BEGIN
    SELECT
        doctor_id,
        COUNT(patient_id) AS patients_seen
    FROM
        appointment
    WHERE
        YEAR(appointment_time) = input_year
    GROUP BY
        doctor_id
    ORDER BY
        patients_seen DESC
    LIMIT 1;
END$

-- ---------------------------------------------------------------------
-- Extra: appointment volume per doctor per month, for the admin report.
-- Pass NULL for input_year to cover every year on record.
-- Usage: CALL get_monthly_appointment_report_by_doctor(2025);
-- ---------------------------------------------------------------------
CREATE PROCEDURE get_monthly_appointment_report_by_doctor(
    IN input_year INT
)
BEGIN
    SELECT
        d.name                                        AS doctor_name,
        d.specialty                                   AS specialty,
        DATE_FORMAT(a.appointment_time, '%Y-%m')      AS report_month,
        COUNT(a.id)                                   AS total_appointments,
        SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN a.status = 0 THEN 1 ELSE 0 END) AS scheduled
    FROM appointment a
    JOIN doctor d ON d.id = a.doctor_id
    WHERE input_year IS NULL OR YEAR(a.appointment_time) = input_year
    GROUP BY d.name, d.specialty, report_month
    ORDER BY report_month, total_appointments DESC;
END$

DELIMITER ;
