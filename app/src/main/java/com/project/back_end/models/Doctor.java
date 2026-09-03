package com.project.back_end.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "name cannot be null")
    @Size(min = 3, max = 100, message = "name must be between 3 and 100 characters")
    private String name;

    @NotNull(message = "specialty cannot be null")
    @Size(min = 3, max = 50, message = "specialty must be between 3 and 50 characters")
    private String specialty;

    @NotNull(message = "email cannot be null")
    @Email(message = "email should be a valid email address")
    private String email;

    @NotNull(message = "password cannot be null")
    @Size(min = 6, message = "password must be at least 6 characters long")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @NotNull(message = "phone cannot be null")
    @Pattern(regexp = "^[0-9]{10}$", message = "phone number must be exactly 10 digits")
    private String phone;

    @ElementCollection
    private List<String> availableTimes = new ArrayList<>();

    // Optional profile details. Left nullable so existing doctors stay valid.

    @Min(value = 0, message = "years of experience cannot be negative")
    @Max(value = 70, message = "years of experience cannot exceed 70")
    private Integer yearsOfExperience;

    @Size(max = 255, message = "clinic address cannot exceed 255 characters")
    private String clinicAddress;

    @Min(value = 0, message = "rating cannot be below 0")
    @Max(value = 5, message = "rating cannot be above 5")
    private Double rating;

    public Doctor() {
    }

    public Doctor(String name, String specialty, String email, String password, String phone) {
        this.name = name;
        this.specialty = specialty;
        this.email = email;
        this.password = password;
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public List<String> getAvailableTimes() {
        return availableTimes;
    }

    public void setAvailableTimes(List<String> availableTimes) {
        this.availableTimes = availableTimes;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public String getClinicAddress() {
        return clinicAddress;
    }

    public void setClinicAddress(String clinicAddress) {
        this.clinicAddress = clinicAddress;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}
