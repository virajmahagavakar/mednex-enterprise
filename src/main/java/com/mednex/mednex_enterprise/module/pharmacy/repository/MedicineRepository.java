package com.mednex.mednex_enterprise.module.pharmacy.repository;

import com.mednex.mednex_enterprise.module.pharmacy.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, UUID> {
    boolean existsByName(String name);
}
