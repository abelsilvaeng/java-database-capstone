package com.project.back_end;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
import com.project.back_end.models.Prescription;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.LocalDate;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Exercises the bean-validation annotations directly, without a Spring context or a
 * database, so the constraints are proven rather than assumed.
 */
class ModelValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    private Doctor validDoctor() {
        return new Doctor("Dr. Alice Mendes", "Cardiology",
                "alice@smartclinic.com", "doctor123", "5551000001");
    }

    private Patient validPatient() {
        return new Patient("Maria Silva", "maria@example.com",
                "patient123", "5552000001", "742 Evergreen Ave");
    }

    @Test
    void doctorWithoutOptionalFieldsIsValid() {
        assertTrue(validator.validate(validDoctor()).isEmpty());
    }

    @Test
    void ratingAboveFiveIsRejected() {
        Doctor doctor = validDoctor();
        doctor.setRating(6.0);
        Set<ConstraintViolation<Doctor>> violations = validator.validate(doctor);
        assertEquals(1, violations.size());
        assertEquals("rating cannot be above 5", violations.iterator().next().getMessage());
    }

    @Test
    void negativeYearsOfExperienceIsRejected() {
        Doctor doctor = validDoctor();
        doctor.setYearsOfExperience(-1);
        assertEquals(1, validator.validate(doctor).size());
    }

    @Test
    void badlyFormattedPhoneIsRejected() {
        Doctor doctor = validDoctor();
        doctor.setPhone("555-1000");
        assertEquals(1, validator.validate(doctor).size());
    }

    @Test
    void futureDateOfBirthIsRejected() {
        Patient patient = validPatient();
        patient.setDateOfBirth(LocalDate.now().plusDays(1));
        Set<ConstraintViolation<Patient>> violations = validator.validate(patient);
        assertEquals(1, violations.size());
        assertEquals("date of birth must be in the past", violations.iterator().next().getMessage());
    }

    @Test
    void pastDateOfBirthIsAccepted() {
        Patient patient = validPatient();
        patient.setDateOfBirth(LocalDate.of(1988, 3, 14));
        assertTrue(validator.validate(patient).isEmpty());
    }

    @Test
    void dosageShorterThanThreeCharactersIsRejected() {
        Prescription prescription =
                new Prescription("Maria Silva", 1L, "Atenolol", "1%", "One tablet each morning.");
        Set<ConstraintViolation<Prescription>> violations = validator.validate(prescription);
        assertEquals(1, violations.size());
        assertTrue(violations.iterator().next().getMessage().contains("dosage"));
    }

    @Test
    void refillCountAboveTwelveIsRejected() {
        Prescription prescription =
                new Prescription("Maria Silva", 1L, "Atenolol", "50mg", "One tablet each morning.");
        prescription.setRefillCount(13);
        assertEquals(1, validator.validate(prescription).size());
    }
}
