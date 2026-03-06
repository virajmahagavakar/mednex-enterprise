package com.mednex.mednex_enterprise.module.clinical.surgery.repository;

import com.mednex.mednex_enterprise.module.clinical.surgery.entity.SurgicalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SurgicalNoteRepository extends JpaRepository<SurgicalNote, UUID> {
}
