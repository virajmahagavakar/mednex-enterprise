package com.mednex.mednex_enterprise.module.pharmacy.repository;

import com.mednex.mednex_enterprise.module.pharmacy.entity.InventoryBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, UUID> {

    List<InventoryBatch> findByMedicineIdAndStatusOrderByExpiryDateAsc(UUID medicineId,
            InventoryBatch.BatchStatus status);

    @Query("SELECT SUM(ib.quantityAvailable) FROM InventoryBatch ib WHERE ib.medicine.id = :medicineId AND ib.status = 'ACTIVE'")
    Integer getTotalAvailableQuantityByMedicine(@Param("medicineId") UUID medicineId);

    @Query("SELECT ib FROM InventoryBatch ib WHERE ib.status = 'ACTIVE' AND ib.expiryDate <= :expiryDateAlert")
    List<InventoryBatch> findExpiringSoonBatches(@Param("expiryDateAlert") LocalDate expiryDateAlert);

    @Query("SELECT b FROM InventoryBatch b JOIN b.medicine m WHERE b.status = 'ACTIVE' GROUP BY m HAVING SUM(b.quantityAvailable) < MAX(m.minimumStockLevel)")
    List<InventoryBatch> findLowStockMedicines(); // This will return a list of batches, in service layer we map to
                                                  // medicines
}
