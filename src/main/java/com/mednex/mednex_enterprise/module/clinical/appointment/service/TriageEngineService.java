package com.mednex.mednex_enterprise.module.clinical.appointment.service;

import com.mednex.mednex_enterprise.module.clinical.appointment.entity.UrgencyLevel;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TriageEngineService {

    private static final Map<String, TriageSuggestion> RULES = new HashMap<>();

    static {
        // Suggested by user and common HMS mappings
        RULES.put("chest pain", new TriageSuggestion("Cardiology", UrgencyLevel.CRITICAL));
        RULES.put("heart", new TriageSuggestion("Cardiology", UrgencyLevel.URGENT));
        RULES.put("fever", new TriageSuggestion("General Physician", UrgencyLevel.ROUTINE));
        RULES.put("skin rash", new TriageSuggestion("Dermatology", UrgencyLevel.ROUTINE));
        RULES.put("rash", new TriageSuggestion("Dermatology", UrgencyLevel.ROUTINE));
        RULES.put("fracture", new TriageSuggestion("Orthopedics", UrgencyLevel.URGENT));
        RULES.put("bone", new TriageSuggestion("Orthopedics", UrgencyLevel.URGENT));
        RULES.put("stomach", new TriageSuggestion("Gastroenterology", UrgencyLevel.ROUTINE));
        RULES.put("abdominal", new TriageSuggestion("Gastroenterology", UrgencyLevel.URGENT));
        RULES.put("cough", new TriageSuggestion("Pulmonology", UrgencyLevel.ROUTINE));
        RULES.put("breathing", new TriageSuggestion("Pulmonology", UrgencyLevel.URGENT));
    }

    public TriageSuggestion suggest(String symptoms) {
        if (symptoms == null || symptoms.isBlank()) {
            return new TriageSuggestion("General Medicine", UrgencyLevel.ROUTINE);
        }

        String lowerSymptoms = symptoms.toLowerCase();
        
        for (Map.Entry<String, TriageSuggestion> entry : RULES.entrySet()) {
            if (lowerSymptoms.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return new TriageSuggestion("General Medicine", UrgencyLevel.ROUTINE);
    }

    @Data
    public static class TriageSuggestion {
        private final String department;
        private final UrgencyLevel urgency;
    }
}
