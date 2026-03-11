package com.mednex.mednex_enterprise.module.clinical.appointment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.Appointment;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.AppointmentStatus;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

        @Query("SELECT a FROM Appointment a JOIN FETCH a.patient p LEFT JOIN FETCH a.doctor d WHERE a.doctor.id = :doctorId ORDER BY a.appointmentTime ASC")
        List<Appointment> findByDoctorIdOrderByAppointmentTimeAsc(@Param("doctorId") UUID doctorId);

        @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor WHERE a.patient.id = :patientId ORDER BY CASE WHEN a.appointmentTime IS NULL THEN 0 ELSE 1 END DESC, a.appointmentTime DESC")
        List<Appointment> findByPatientIdOrderByAppointmentTimeDesc(@Param("patientId") UUID patientId);

        @Query("SELECT a FROM Appointment a JOIN FETCH a.patient p LEFT JOIN FETCH a.doctor d WHERE a.doctor.id = :doctorId AND a.appointmentTime BETWEEN :start AND :end ORDER BY a.appointmentTime ASC")
        List<Appointment> findByDoctorIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(@Param("doctorId") UUID doctorId,
                        @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        List<Appointment> findByPatientId(UUID patientId);

        List<Appointment> findByBranchId(UUID branchId);

        @Query("SELECT a FROM Appointment a JOIN FETCH a.patient WHERE a.status IN :statuses ORDER BY a.appointmentTime ASC")
        List<Appointment> findByStatusInOrderByAppointmentTimeAsc(@Param("statuses") List<AppointmentStatus> statuses);

        @Query("SELECT a FROM Appointment a JOIN FETCH a.patient WHERE a.status = :status")
        List<Appointment> findByStatusWithPatient(@Param("status") AppointmentStatus status);

        List<Appointment> findByStatus(AppointmentStatus status);

        boolean existsByDoctorIdAndAppointmentTime(UUID doctorId, LocalDateTime time);

        @Query("SELECT a FROM Appointment a JOIN FETCH a.patient WHERE a.appointmentTime BETWEEN :start AND :end ORDER BY a.appointmentTime ASC")
        List<Appointment> findByAppointmentTimeBetweenOrderByAppointmentTimeAsc(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = :status")
        long countAppointmentsByDoctorAndStatus(@Param("doctorId") UUID doctorId,
                        @Param("status") AppointmentStatus status);

        @Query("SELECT MAX(a.tokenNumber) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentTime >= :startOfDay AND a.appointmentTime <= :endOfDay")
        Integer findMaxTokenNumberByDoctorAndDate(@Param("doctorId") UUID doctorId,
                        @Param("startOfDay") LocalDateTime startOfDay,
                        @Param("endOfDay") LocalDateTime endOfDay);
        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = :status AND a.appointmentTime BETWEEN :start AND :end")
        long countByDoctorIdAndStatusAndAppointmentTimeBetween(@Param("doctorId") UUID doctorId, 
                @Param("status") AppointmentStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        @Query("SELECT COUNT(DISTINCT a.patient.id) FROM Appointment a WHERE a.doctor.id = :doctorId")
        long countDistinctPatientIdByDoctorId(@Param("doctorId") UUID doctorId);

        @Query("SELECT a FROM Appointment a JOIN FETCH a.patient p WHERE a.doctor.id = :doctorId AND a.status = :status AND a.appointmentTime >= :now ORDER BY a.appointmentTime ASC")
        List<Appointment> findNextAppointments(@Param("doctorId") UUID doctorId, @Param("status") AppointmentStatus status, @Param("now") LocalDateTime now, org.springframework.data.domain.Pageable pageable);

        @Query("SELECT CAST(a.appointmentTime as date) as date, COUNT(a) as total FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = 'COMPLETED' AND a.appointmentTime BETWEEN :start AND :end GROUP BY CAST(a.appointmentTime as date) ORDER BY CAST(a.appointmentTime as date) ASC")
        List<Object[]> findDailyConsultationsCount(@Param("doctorId") UUID doctorId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        @Query("SELECT a FROM Appointment a JOIN FETCH a.patient p WHERE a.doctor.id = :doctorId AND a.status = :status ORDER BY a.updatedAt ASC")
        List<Appointment> findQueueByDoctorAndStatus(@Param("doctorId") UUID doctorId, @Param("status") AppointmentStatus status, org.springframework.data.domain.Pageable pageable);
}
