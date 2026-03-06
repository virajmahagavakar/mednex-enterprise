package com.mednex.mednex_enterprise.module.clinical.doctor.repository;

import com.mednex.mednex_enterprise.module.clinical.doctor.entity.ClinicalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClinicalNoteRepository extends JpaRepository<ClinicalNote, UUID> {
    List<ClinicalNote> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    Optional<ClinicalNote> findByAppointmentId(UUID appointmentId);
}
