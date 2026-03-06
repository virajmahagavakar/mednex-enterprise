package com.mednex.mednex_enterprise;

import com.mednex.mednex_enterprise.core.entity.Role;
import com.mednex.mednex_enterprise.core.repository.RoleRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Ward;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.Bed;
import com.mednex.mednex_enterprise.module.clinical.ipd.entity.BedStatus;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.WardRepository;
import com.mednex.mednex_enterprise.module.clinical.ipd.repository.BedRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MednexEnterpriseApplication {

    public static void main(String[] args) {
        SpringApplication.run(MednexEnterpriseApplication.class, args);
    }

    @Bean
    CommandLineRunner initRole(RoleRepository roleRepository) {
        return args -> {
            if (roleRepository.findByName("BRANCH_ADMIN").isEmpty()) {
                Role branchAdminRole = new Role();
                branchAdminRole.setName("BRANCH_ADMIN");
                branchAdminRole.setDescription("Administrator for a specific hospital branch");
                roleRepository.save(branchAdminRole);
            }
            if (roleRepository.findByName("PATIENT").isEmpty()) {
                Role patientRole = new Role();
                patientRole.setName("PATIENT");
                patientRole.setDescription("Mednex Enterprise Patient User");
                roleRepository.save(patientRole);
            }
            if (roleRepository.findByName("PHARMACIST").isEmpty()) {
                Role pharmacistRole = new Role();
                pharmacistRole.setName("PHARMACIST");
                pharmacistRole.setDescription("Mednex Enterprise Pharmacist");
                roleRepository.save(pharmacistRole);
            }
        };
    }

    @Bean
    CommandLineRunner initIpdData(WardRepository wardRepository, BedRepository bedRepository) {
        return args -> {
            if (wardRepository.count() == 0) {
                Ward generalWard = new Ward();
                generalWard.setName("General Ward");
                generalWard.setTotalCapacity(5);
                generalWard = wardRepository.save(generalWard);

                for (int i = 1; i <= 5; i++) {
                    Bed bed = new Bed();
                    bed.setWard(generalWard);
                    bed.setRoomNumber("G-10" + ((i - 1) / 2 + 1));
                    bed.setBedNumber("B-" + i);
                    bed.setStatus(BedStatus.AVAILABLE);
                    bedRepository.save(bed);
                }
            }
        };
    }
}
