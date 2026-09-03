package com.project.back_end;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.project.back_end.models.Doctor;
import com.project.back_end.services.DoctorService;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * filterDoctorByTime works purely on the in-memory list, so it can be exercised
 * without a database or any Spring context.
 */
class DoctorServiceFilterTest {

    private final DoctorService doctorService = new DoctorService(null, null, null);

    private Doctor doctorWithSlots(String name, String... slots) {
        Doctor doctor = new Doctor(name, "Cardiology", name + "@smartclinic.com", "doctor123", "5551000001");
        doctor.setAvailableTimes(Arrays.asList(slots));
        return doctor;
    }

    @Test
    void amKeepsOnlyDoctorsWithMorningSlots() {
        List<Doctor> doctors = Arrays.asList(
                doctorWithSlots("Morning Only", "09:00-10:00", "10:00-11:00"),
                doctorWithSlots("Afternoon Only", "14:00-15:00"),
                doctorWithSlots("Both", "08:00-09:00", "16:00-17:00"));

        List<Doctor> filtered = doctorService.filterDoctorByTime(doctors, "AM");

        assertEquals(2, filtered.size());
        assertEquals("Morning Only", filtered.get(0).getName());
        assertEquals("Both", filtered.get(1).getName());
    }

    @Test
    void pmKeepsOnlyDoctorsWithAfternoonSlots() {
        List<Doctor> doctors = Arrays.asList(
                doctorWithSlots("Morning Only", "09:00-10:00"),
                doctorWithSlots("Afternoon Only", "14:00-15:00"));

        List<Doctor> filtered = doctorService.filterDoctorByTime(doctors, "PM");

        assertEquals(1, filtered.size());
        assertEquals("Afternoon Only", filtered.get(0).getName());
    }

    @Test
    void noPeriodKeepsEveryDoctorThatPublishesAnySlot() {
        List<Doctor> doctors = Arrays.asList(
                doctorWithSlots("Morning Only", "09:00-10:00"),
                doctorWithSlots("Afternoon Only", "14:00-15:00"));

        assertEquals(2, doctorService.filterDoctorByTime(doctors, "").size());
    }

    @Test
    void anExplicitSlotIsMatchedDirectly() {
        // The lab's own curl passes a slot, not AM/PM:
        //   GET /doctor/filter/null/09:00-10:00/Cardiologist
        List<Doctor> doctors = Arrays.asList(
                doctorWithSlots("Has The Slot", "09:00-10:00", "14:00-15:00"),
                doctorWithSlots("Different Slots", "11:00-12:00"));

        List<Doctor> filtered = doctorService.filterDoctorByTime(doctors, "09:00-10:00");

        assertEquals(1, filtered.size());
        assertEquals("Has The Slot", filtered.get(0).getName());
    }

    @Test
    void theLiteralStringNullMeansNoTimeFilter() {
        List<Doctor> doctors = Arrays.asList(
                doctorWithSlots("Morning", "09:00-10:00"),
                doctorWithSlots("Afternoon", "14:00-15:00"));

        assertEquals(2, doctorService.filterDoctorByTime(doctors, "null").size());
    }

    @Test
    void doctorWithoutSlotsIsNeverReturned() {
        List<Doctor> doctors = Arrays.asList(doctorWithSlots("No Slots"));
        assertTrue(doctorService.filterDoctorByTime(doctors, "AM").isEmpty());
    }
}
