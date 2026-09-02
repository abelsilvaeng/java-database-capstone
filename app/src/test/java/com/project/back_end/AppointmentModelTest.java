package com.project.back_end;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;

/** The derived fields on Appointment are not persisted, so they are worth pinning down. */
class AppointmentModelTest {

    private Appointment sampleAppointment() {
        Doctor doctor = new Doctor("Dr. Alice Mendes", "Cardiology",
                "alice@smartclinic.com", "doctor123", "5551000001");
        Patient patient = new Patient("Maria Silva", "maria@example.com",
                "patient123", "5552000001", "742 Evergreen Ave");
        return new Appointment(doctor, patient, LocalDateTime.of(2030, 5, 10, 14, 30), 0);
    }

    @Test
    void endTimeIsOneHourAfterTheStart() {
        assertEquals(LocalDateTime.of(2030, 5, 10, 15, 30), sampleAppointment().getEndTime());
    }

    @Test
    void appointmentDateDropsTheTime() {
        assertEquals(LocalDate.of(2030, 5, 10), sampleAppointment().getAppointmentDate());
    }

    @Test
    void appointmentTimeOnlyDropsTheDate() {
        assertEquals(LocalTime.of(14, 30), sampleAppointment().getAppointmentTimeOnly());
    }

    @Test
    void derivedFieldsAreNullWhenNoTimeIsSet() {
        Appointment appointment = new Appointment();
        assertNull(appointment.getEndTime());
        assertNull(appointment.getAppointmentDate());
        assertNull(appointment.getAppointmentTimeOnly());
    }
}
