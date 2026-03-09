package com.mednex.mednex_enterprise.core.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/debug/repair")
@RequiredArgsConstructor
public class DatabaseRepairController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/sync-appointment-schema")
    public String repairAppointmentSchema() {
        try {
            // Add department_preference if it doesn't exist
            jdbcTemplate.execute("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS department_preference VARCHAR(255)");
            
<<<<<<< HEAD
            // Add urgency_level if it doesn't exist (just in case)
=======
            // Add urgency_level if it doesn't exist
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
            jdbcTemplate.execute("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(50)");
            
            // Add problem_description if it doesn't exist
            jdbcTemplate.execute("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS problem_description TEXT");

<<<<<<< HEAD
            return "Database schema repair completed successfully.";
=======
            // Add is_walk_in if it doesn't exist
            jdbcTemplate.execute("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_walk_in BOOLEAN DEFAULT FALSE");
            
            // Add reason_for_visit if it doesn't exist
            jdbcTemplate.execute("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reason_for_visit TEXT");

            // Add preferred_date if it doesn't exist
            jdbcTemplate.execute("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS preferred_date TIMESTAMP");

            // Add symptoms if it doesn't exist
            jdbcTemplate.execute("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS symptoms TEXT");

            return "Database schema repair completed successfully. appointments table is now synchronized.";
>>>>>>> 004ae865de593a2f84f799d3147435c4e91fa6d3
        } catch (Exception e) {
            return "Error during database repair: " + e.getMessage();
        }
    }
}
