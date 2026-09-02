package com.project.back_end;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.project.back_end.DTO.AppointmentDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;

class AppointmentDTOTest {

    @Test
    void constructorDerivesDateTimeAndEndTime() {
        AppointmentDTO dto = new AppointmentDTO(
                7L, 1L, "Dr. Alice Mendes", 3L, "Maria Silva",
                "maria@example.com", "5552000001", "742 Evergreen Ave",
                LocalDateTime.of(2030, 5, 10, 9, 0), 0);

        assertEquals(LocalDate.of(2030, 5, 10), dto.getAppointmentDate());
        assertEquals(LocalTime.of(9, 0), dto.getAppointmentTimeOnly());
        assertEquals(LocalDateTime.of(2030, 5, 10, 10, 0), dto.getEndTime());
        assertEquals("Dr. Alice Mendes", dto.getDoctorName());
        assertEquals(0, dto.getStatus());
    }
}
