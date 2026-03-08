package com.mednex.mednex_enterprise.module.clinical.appointment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

        List<Appointment> findByDoctorIdOrderByAppointmentTimeAsc(UUID doctorId);

        List<Appointment> findByPatientIdOrderByAppointmentTimeDesc(UUID patientId);

        List<Appointment> findByDoctorIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(UUID doctorId,
                        LocalDateTime start, LocalDateTime end);

        List<Appointment> findByPatientId(UUID patientId);

        List<Appointment> findByBranchId(UUID branchId);

        List<Appointment> findByStatusInOrderByAppointmentTimeAsc(List<AppointmentStatus> statuses);

        List<Appointment> findByStatus(AppointmentStatus status);

        boolean existsByDoctorIdAndAppointmentTime(UUID doctorId, LocalDateTime time);

        List<Appointment> findByAppointmentTimeBetweenOrderByAppointmentTimeAsc(LocalDateTime start, LocalDateTime end);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = :status")
        long countAppointmentsByDoctorAndStatus(@Param("doctorId") UUID doctorId,
                        @Param("status") AppointmentStatus status);

        @Query("SELECT MAX(a.tokenNumber) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentTime >= :startOfDay AND a.appointmentTime <= :endOfDay")
        Integer findMaxTokenNumberByDoctorAndDate(@Param("doctorId") UUID doctorId,
                        @Param("startOfDay") LocalDateTime startOfDay,
                        @Param("endOfDay") LocalDateTime endOfDay);
}
