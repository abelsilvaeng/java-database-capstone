package com.project.back_end.services;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.PatientRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientService {

    private static final Logger logger = LoggerFactory.getLogger(PatientService.class);

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;

    public PatientService(PatientRepository patientRepository,
                          AppointmentRepository appointmentRepository,
                          TokenService tokenService) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    public int createPatient(Patient patient) {
        try {
            patientRepository.save(patient);
            return 1;
        } catch (Exception e) {
            logger.error("Error creating patient", e);
            return 0;
        }
    }

    private AppointmentDTO toDTO(Appointment appointment) {
        return new AppointmentDTO(
                appointment.getId(),
                appointment.getDoctor().getId(),
                appointment.getDoctor().getName(),
                appointment.getPatient().getId(),
                appointment.getPatient().getName(),
                appointment.getPatient().getEmail(),
                appointment.getPatient().getPhone(),
                appointment.getPatient().getAddress(),
                appointment.getAppointmentTime(),
                appointment.getStatus());
    }

    private List<AppointmentDTO> toDTOs(List<Appointment> appointments) {
        List<AppointmentDTO> dtos = new ArrayList<>();
        for (Appointment appointment : appointments) {
            dtos.add(toDTO(appointment));
        }
        return dtos;
    }

    /**
     * Same listing, but reached by a doctor rather than by the patient. A doctor is
     * allowed to read the history of any patient they are treating, so the ownership
     * check that applies to patients is skipped here; the caller has already proven
     * the token belongs to a doctor.
     */
    @Transactional
    public ResponseEntity<Map<String, Object>> getPatientAppointment(Long id, String token, String user) {
        if ("doctor".equalsIgnoreCase(user)) {
            Map<String, Object> response = new HashMap<>();
            try {
                response.put("appointments", toDTOs(appointmentRepository.findByPatientId(id)));
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                logger.error("Error fetching patient appointments for doctor", e);
                response.put("message", "Internal server error");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        }
        return getPatientAppointment(id, token);
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> getPatientAppointment(Long id, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = tokenService.extractEmail(token);
            Patient patient = patientRepository.findByEmail(email);
            if (patient == null || !patient.getId().equals(id)) {
                response.put("message", "Unauthorized access");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            response.put("appointments", toDTOs(appointmentRepository.findByPatientId(id)));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching patient appointments", e);
            response.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> filterByCondition(String condition, Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer status = statusFor(condition);
            if (status == null) {
                response.put("message", "Invalid condition. Use past or future");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            List<Appointment> appointments =
                    appointmentRepository.findByPatient_IdAndStatusOrderByAppointmentTimeAsc(id, status);
            response.put("appointments", toDTOs(appointments));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error filtering appointments by condition", e);
            response.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /** 0 is a scheduled (future) appointment, 1 is a completed (past) one. */
    private Integer statusFor(String condition) {
        if ("future".equalsIgnoreCase(condition)) {
            return 0;
        }
        if ("past".equalsIgnoreCase(condition)) {
            return 1;
        }
        return null;
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> filterByDoctor(String name, Long patientId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Appointment> appointments =
                    appointmentRepository.filterByDoctorNameAndPatientId(name, patientId);
            response.put("appointments", toDTOs(appointments));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error filtering appointments by doctor", e);
            response.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> filterByDoctorAndCondition(String condition,
                                                                          String name,
                                                                          long patientId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer status = statusFor(condition);
            if (status == null) {
                response.put("message", "Invalid condition. Use past or future");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            List<Appointment> appointments = appointmentRepository
                    .filterByDoctorNameAndPatientIdAndStatus(name, patientId, status);
            response.put("appointments", toDTOs(appointments));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error filtering appointments by doctor and condition", e);
            response.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public ResponseEntity<Map<String, Object>> getPatientDetails(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = tokenService.extractEmail(token);
            Patient patient = patientRepository.findByEmail(email);
            if (patient == null) {
                response.put("message", "Patient not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            response.put("patient", patient);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching patient details", e);
            response.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
