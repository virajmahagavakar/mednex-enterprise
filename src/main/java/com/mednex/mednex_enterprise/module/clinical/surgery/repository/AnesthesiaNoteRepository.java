package com.mednex.mednex_enterprise.module.clinical.surgery.repository;

import com.mednex.mednex_enterprise.module.clinical.surgery.entity.AnesthesiaNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AnesthesiaNoteRepository extends JpaRepository<AnesthesiaNote, UUID> {
}
