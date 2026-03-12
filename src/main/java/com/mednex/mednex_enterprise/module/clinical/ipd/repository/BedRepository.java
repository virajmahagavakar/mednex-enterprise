package com.mednex.mednex_enterprise.module.clinical.ipd.repository;

import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Bed;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.BedStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BedRepository extends JpaRepository<Bed, UUID> {
    List<Bed> findByWardId(UUID wardId);

    List<Bed> findByRoomId(UUID roomId);

    List<Bed> findByWardIdAndStatus(UUID wardId, BedStatus status);

    long countByWardIdAndStatus(UUID wardId, BedStatus status);
}
