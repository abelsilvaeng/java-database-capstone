-- =====================================================================
-- Smart Clinic Management System - stored procedures
-- Run after SQL/cms.sql and SQL/insert-sample-data.sql.
--
-- These procedures answer the reporting questions the admin dashboard
-- asks most often, computed from live appointment data.
-- =====================================================================

USE cms;

DROP PROCEDURE IF EXISTS GetDailyAppointmentReportByDoctor;
DROP PROCEDURE IF EXISTS GetDoctorWithMostPatientsByMonth;
DROP PROCEDURE IF EXISTS GetDoctorWithMostPatientsByYear;
DROP PROCEDURE IF EXISTS get_monthly_appointment_report_by_doctor;

DELIMITER $$

-- ---------------------------------------------------------------------
-- Every appointment on a given date, doctor by doctor.
-- Usage: CALL GetDailyAppointmentReportByDoctor('2026-09-10');
-- ---------------------------------------------------------------------
CREATE PROCEDURE GetDailyAppointmentReportByDoctor(IN report_date DATE)
BEGIN
    SELECT
        d.name                        AS doctor_name,
        d.specialty                   AS specialty,
        a.appointment_time            AS appointment_time,
        p.name                        AS patient_name,
        p.phone                       AS patient_phone,
        CASE a.status
            WHEN 0 THEN 'Scheduled'
            WHEN 1 THEN 'Completed'
            ELSE 'Unknown'
        END                           AS appointment_status
    FROM appointment a
    JOIN doctor  d ON d.id = a.doctor_id
    JOIN patient p ON p.id = a.patient_id
    WHERE DATE(a.appointment_time) = report_date
    ORDER BY d.name, a.appointment_time;
END $$

-- ---------------------------------------------------------------------
-- Which doctor saw the most patients in a given month.
-- Usage: CALL GetDoctorWithMostPatientsByMonth(9, 2026);
-- ---------------------------------------------------------------------
CREATE PROCEDURE GetDoctorWithMostPatientsByMonth(IN input_month INT, IN input_year INT)
BEGIN
    SELECT
        d.id                          AS doctor_id,
        d.name                        AS doctor_name,
        d.specialty                   AS specialty,
        COUNT(a.id)                   AS appointment_count,
        COUNT(DISTINCT a.patient_id)  AS distinct_patients
    FROM appointment a
    JOIN doctor d ON d.id = a.doctor_id
    WHERE MONTH(a.appointment_time) = input_month
      AND YEAR(a.appointment_time)  = input_year
    GROUP BY d.id, d.name, d.specialty
    ORDER BY appointment_count DESC
    LIMIT 1;
END $$

-- ---------------------------------------------------------------------
-- Which doctor saw the most patients across a whole year.
-- Usage: CALL GetDoctorWithMostPatientsByYear(2026);
-- ---------------------------------------------------------------------
CREATE PROCEDURE GetDoctorWithMostPatientsByYear(IN input_year INT)
BEGIN
    SELECT
        d.id                          AS doctor_id,
        d.name                        AS doctor_name,
        d.specialty                   AS specialty,
        COUNT(a.id)                   AS appointment_count,
        COUNT(DISTINCT a.patient_id)  AS distinct_patients
    FROM appointment a
    JOIN doctor d ON d.id = a.doctor_id
    WHERE YEAR(a.appointment_time) = input_year
    GROUP BY d.id, d.name, d.specialty
    ORDER BY appointment_count DESC
    LIMIT 1;
END $$

-- ---------------------------------------------------------------------
-- Appointment volume per doctor per month, for the admin report.
-- Pass NULL for input_year to cover every year on record.
-- Usage: CALL get_monthly_appointment_report_by_doctor(2026);
--        CALL get_monthly_appointment_report_by_doctor(NULL);
-- ---------------------------------------------------------------------
CREATE PROCEDURE get_monthly_appointment_report_by_doctor(IN input_year INT)
BEGIN
    SELECT
        d.name                                              AS doctor_name,
        d.specialty                                         AS specialty,
        DATE_FORMAT(a.appointment_time, '%Y-%m')            AS report_month,
        COUNT(a.id)                                         AS total_appointments,
        SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END)       AS completed,
        SUM(CASE WHEN a.status = 0 THEN 1 ELSE 0 END)       AS scheduled
    FROM appointment a
    JOIN doctor d ON d.id = a.doctor_id
    WHERE input_year IS NULL OR YEAR(a.appointment_time) = input_year
    GROUP BY d.name, d.specialty, report_month
    ORDER BY report_month, total_appointments DESC;
END $$

DELIMITER ;
