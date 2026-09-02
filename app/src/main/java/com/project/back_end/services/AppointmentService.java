package com.project.back_end.services;

import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRepository appointmentRepository;
    private final com.project.back_end.services.Service service;
    private final TokenService tokenService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              com.project.back_end.services.Service service,
                              TokenService tokenService,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.service = service;
        this.tokenService = tokenService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional
    public int bookAppointment(Appointment appointment) {
        try {
            resolveReferences(appointment);
            appointmentRepository.save(appointment);
            return 1;
        } catch (Exception e) {
            logger.error("Error booking appointment", e);
            return 0;
        }
    }

    /**
     * The client sends the doctor and patient as bare ids, so replace those stubs with
     * the managed entities before the appointment is persisted.
     */
    private void resolveReferences(Appointment appointment) {
        if (appointment.getDoctor() != null && appointment.getDoctor().getId() != null) {
            doctorRepository.findById(appointment.getDoctor().getId()).ifPresent(appointment::setDoctor);
        }
        if (appointment.getPatient() != null && appointment.getPatient().getId() != null) {
            patientRepository.findById(appointment.getPatient().getId()).ifPresent(appointment::setPatient);
        }
    }

    @Transactional
    public ResponseEntity<Map<String, String>> updateAppointment(Appointment appointment) {
        Map<String, String> response = new HashMap<>();
        Optional<Appointment> existing = appointmentRepository.findById(appointment.getId());
        if (existing.isEmpty()) {
            response.put("message", "Appointment not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Appointment stored = existing.get();
        if (!stored.getPatient().getId().equals(appointment.getPatient().getId())) {
            response.put("message", "Patient id mismatch");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (service.validateAppointment(appointment) != 1) {
            response.put("message", "Doctor is not available at the requested time");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        resolveReferences(appointment);
        stored.setAppointmentTime(appointment.getAppointmentTime());
        stored.setDoctor(appointment.getDoctor());
        appointmentRepository.save(stored);
        response.put("message", "Appointment updated successfully");
        return ResponseEntity.ok(response);
    }

    @Transactional
    public ResponseEntity<Map<String, String>> cancelAppointment(long id, String token) {
        Map<String, String> response = new HashMap<>();
        Optional<Appointment> existing = appointmentRepository.findById(id);
        if (existing.isEmpty()) {
            response.put("message", "Appointment not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        String email = tokenService.extractEmail(token);
        Patient patient = patientRepository.findByEmail(email);
        if (patient == null || !existing.get().getPatient().getId().equals(patient.getId())) {
            response.put("message", "You are not allowed to cancel this appointment");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        appointmentRepository.delete(existing.get());
        response.put("message", "Appointment cancelled successfully");
        return ResponseEntity.ok(response);
    }

    @Transactional
    public Map<String, Object> getAppointment(String patientName, LocalDate date, String token) {
        Map<String, Object> response = new HashMap<>();
        String email = tokenService.extractEmail(token);
        var doctor = doctorRepository.findByEmail(email);
        if (doctor == null) {
            response.put("appointments", new ArrayList<>());
            return response;
        }

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        List<Appointment> appointments;
        if (patientName == null || patientName.isBlank() || "null".equalsIgnoreCase(patientName)) {
            appointments = appointmentRepository
                    .findByDoctorIdAndAppointmentTimeBetween(doctor.getId(), start, end);
        } else {
            appointments = appointmentRepository
                    .findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween(
                            doctor.getId(), patientName, start, end);
        }
        response.put("appointments", appointments);
        return response;
    }

    @Transactional
    public void changeStatus(long id, int status) {
        appointmentRepository.updateStatus(status, id);
    }
}
