package com.mednex.mednex_enterprise.module.clinical.appointment.repository;

import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

        List<Appointment> findByDoctorIdOrderByAppointmentTimeAsc(UUID doctorId);

        List<Appointment> findByPatientIdOrderByAppointmentTimeDesc(UUID patientId);

        List<Appointment> findByDoctorIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(UUID doctorId,
                        LocalDateTime start, LocalDateTime end);

        List<Appointment> findByPatientId(UUID patientId);

        List<Appointment> findByBranchId(UUID branchId);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = :status")
        long countAppointmentsByDoctorAndStatus(@Param("doctorId") UUID doctorId,
                        @Param("status") AppointmentStatus status);
}
