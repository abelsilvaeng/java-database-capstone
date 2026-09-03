-- =====================================================================
-- Smart Clinic Management System - sample data
-- Run after SQL/cms.sql.
--
-- Appointment times are generated relative to CURDATE() so the seeded
-- future appointments stay in the future no matter when this is run
-- (the Appointment entity rejects a past appointmentTime).
-- =====================================================================

USE cms;

-- ---------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------
INSERT INTO admin (username, password) VALUES
('admin',      'admin123'),
('supervisor', 'super456');

-- ---------------------------------------------------------------------
-- Doctors
-- ---------------------------------------------------------------------
INSERT INTO doctor (name, specialty, email, password, phone) VALUES
('Dr. Alice Mendes',    'Cardiology',   'alice.mendes@smartclinic.com',  'doctor123', '5551000001'),
('Dr. Bruno Carvalho',  'Dermatology',  'bruno.carvalho@smartclinic.com','doctor123', '5551000002'),
('Dr. Carla Ribeiro',   'Pediatrics',   'carla.ribeiro@smartclinic.com', 'doctor123', '5551000003'),
('Dr. Daniel Alves',    'Orthopedics',  'daniel.alves@smartclinic.com',  'doctor123', '5551000004'),
('Dr. Elena Souza',     'Neurology',    'elena.souza@smartclinic.com',   'doctor123', '5551000005'),
('Dr. Felipe Nogueira', 'Cardiology',   'felipe.nogueira@smartclinic.com','doctor123','5551000006');

-- ---------------------------------------------------------------------
-- Doctor available times (HH:mm-HH:mm)
-- ---------------------------------------------------------------------
INSERT INTO doctor_available_times (doctor_id, available_times) VALUES
(1, '09:00-10:00'), (1, '10:00-11:00'), (1, '11:00-12:00'), (1, '14:00-15:00'),
(2, '09:00-10:00'), (2, '13:00-14:00'), (2, '14:00-15:00'), (2, '15:00-16:00'),
(3, '08:00-09:00'), (3, '09:00-10:00'), (3, '10:00-11:00'),
(4, '13:00-14:00'), (4, '14:00-15:00'), (4, '16:00-17:00'),
(5, '10:00-11:00'), (5, '11:00-12:00'), (5, '15:00-16:00'),
(6, '08:00-09:00'), (6, '16:00-17:00'), (6, '17:00-18:00');

-- ---------------------------------------------------------------------
-- Patients
-- ---------------------------------------------------------------------
INSERT INTO patient (name, email, password, phone, address) VALUES
('Maria Silva',     'maria.silva@example.com',    'patient123', '5552000001', '742 Evergreen Ave, Springfield'),
('Joao Pereira',    'joao.pereira@example.com',   'patient123', '5552000002', '15 Rua das Flores, Goiania'),
('Ana Costa',       'ana.costa@example.com',      'patient123', '5552000003', '88 Maple Street, Riverside'),
('Pedro Santos',    'pedro.santos@example.com',   'patient123', '5552000004', '301 Ocean Drive, Santos'),
('Luiza Fernandes', 'luiza.fernandes@example.com','patient123', '5552000005', '27 Highland Road, Brasilia'),
('Rafael Lima',     'rafael.lima@example.com',    'patient123', '5552000006', '5 Park Lane, Curitiba');

-- ---------------------------------------------------------------------
-- Appointments
-- status 0 = scheduled (future), status 1 = completed (past)
-- ---------------------------------------------------------------------

-- Completed appointments (in the past)
INSERT INTO appointment (doctor_id, patient_id, appointment_time, status) VALUES
(1, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 30 DAY), '09:00:00'), 1),
(2, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 21 DAY), '13:00:00'), 1),
(3, 3, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 14 DAY), '08:00:00'), 1),
(1, 4, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 10 DAY), '10:00:00'), 1),
(5, 5, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL  7 DAY), '11:00:00'), 1),
(4, 6, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL  3 DAY), '14:00:00'), 1);

-- Scheduled appointments (in the future)
INSERT INTO appointment (doctor_id, patient_id, appointment_time, status) VALUES
(1, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '11:00:00'), 0),
(2, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '14:00:00'), 0),
(3, 5, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY),  '09:00:00'), 0),
(4, 3, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 5 DAY),  '13:00:00'), 0),
(5, 6, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 7 DAY),  '15:00:00'), 0),
(6, 4, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 9 DAY),  '16:00:00'), 0),
(6, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 12 DAY), '17:00:00'), 0);

-- ---------------------------------------------------------------------
-- Optional profile details
-- These columns are nullable, so the inserts above stay valid on their own.
-- Filling them here keeps the sample data realistic without making any of
-- the fields mandatory.
-- ---------------------------------------------------------------------

UPDATE doctor SET years_of_experience = 18, rating = 4.8,
    clinic_address = 'Suite 210, 1200 Health Plaza' WHERE id = 1;
UPDATE doctor SET years_of_experience = 9,  rating = 4.5,
    clinic_address = 'Suite 105, 1200 Health Plaza' WHERE id = 2;
UPDATE doctor SET years_of_experience = 22, rating = 4.9,
    clinic_address = 'Suite 310, 1200 Health Plaza' WHERE id = 3;
UPDATE doctor SET years_of_experience = 6,  rating = 4.2,
    clinic_address = 'Suite 402, 1200 Health Plaza' WHERE id = 4;
UPDATE doctor SET years_of_experience = 14, rating = 4.7,
    clinic_address = 'Suite 118, 1200 Health Plaza' WHERE id = 5;
UPDATE doctor SET years_of_experience = 3,  rating = 4.1,
    clinic_address = 'Suite 220, 1200 Health Plaza' WHERE id = 6;

UPDATE patient SET date_of_birth = '1988-03-14', emergency_contact = '5559000001',
    insurance_provider = 'Unimed' WHERE id = 1;
UPDATE patient SET date_of_birth = '1975-11-02', emergency_contact = '5559000002',
    insurance_provider = 'Bradesco Saude' WHERE id = 2;
UPDATE patient SET date_of_birth = '2016-07-21', emergency_contact = '5559000003',
    insurance_provider = 'Amil' WHERE id = 3;
UPDATE patient SET date_of_birth = '1992-01-09', emergency_contact = '5559000004',
    insurance_provider = 'Unimed' WHERE id = 4;
UPDATE patient SET date_of_birth = '1969-05-30', emergency_contact = '5559000005',
    insurance_provider = 'SulAmerica' WHERE id = 5;
UPDATE patient SET date_of_birth = '2001-09-17', emergency_contact = '5559000006',
    insurance_provider = 'Hapvida' WHERE id = 6;

UPDATE appointment SET reason_for_visit = 'Routine blood pressure review',
    notes = 'Patient reports occasional dizziness in the morning.' WHERE id = 1;
UPDATE appointment SET reason_for_visit = 'Persistent skin rash on forearm' WHERE id = 2;
UPDATE appointment SET reason_for_visit = 'Recurring sore throat',
    notes = 'Third episode this year. Consider referral if it repeats.' WHERE id = 3;
UPDATE appointment SET reason_for_visit = 'Follow-up on medication change' WHERE id = 4;
UPDATE appointment SET reason_for_visit = 'Frequent migraines' WHERE id = 5;
UPDATE appointment SET reason_for_visit = 'Knee pain after running' WHERE id = 6;
