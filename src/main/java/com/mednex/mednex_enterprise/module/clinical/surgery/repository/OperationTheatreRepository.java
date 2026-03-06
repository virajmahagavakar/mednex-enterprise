package com.mednex.mednex_enterprise.module.clinical.surgery.repository;

import com.mednex.mednex_enterprise.module.clinical.surgery.entity.OperationTheatre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OperationTheatreRepository extends JpaRepository<OperationTheatre, UUID> {
    List<OperationTheatre> findByActiveTrue();
}
