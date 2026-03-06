package com.mednex.mednex_enterprise.module.clinical.surgery.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import com.mednex.mednex_enterprise.module.clinical.patient.entity.Patient;
import com.mednex.mednex_enterprise.module.clinical.patient.repository.PatientRepository;
import com.mednex.mednex_enterprise.module.clinical.surgery.dto.AnesthesiaNoteRequest;
import com.mednex.mednex_enterprise.module.clinical.surgery.dto.SurgeryScheduleRequest;
import com.mednex.mednex_enterprise.module.clinical.surgery.dto.SurgicalNoteRequest;
import com.mednex.mednex_enterprise.module.clinical.surgery.entity.*;
import com.mednex.mednex_enterprise.module.clinical.surgery.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SurgeryService {

    private final OperationTheatreRepository theatreRepository;
    private final SurgeryScheduleRepository scheduleRepository;
    private final SurgicalNoteRepository surgicalNoteRepository;
    private final AnesthesiaNoteRepository anesthesiaNoteRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public List<OperationTheatre> getActiveTheatres() {
        return theatreRepository.findByActiveTrue();
    }

    public List<SurgerySchedule> getDailySchedule(LocalDateTime start, LocalDateTime end) {
        return scheduleRepository.findByScheduledStartTimeBetweenOrderByScheduledStartTimeAsc(start, end);
    }

    @Transactional
    public SurgerySchedule bookSurgery(SurgeryScheduleRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        OperationTheatre theatre = theatreRepository.findById(request.getTheatreId())
                .orElseThrow(() -> new RuntimeException("Operation Theatre not found"));
        User surgeon = userRepository.findById(request.getPrimarySurgeonId())
                .orElseThrow(() -> new RuntimeException("Primary Surgeon not found"));

        User anesthetist = null;
        if (request.getAnesthetistId() != null) {
            anesthetist = userRepository.findById(request.getAnesthetistId()).orElse(null);
        }

        SurgerySchedule schedule = SurgerySchedule.builder()
                .patient(patient)
                .theatre(theatre)
                .procedureName(request.getProcedureName())
                .scheduledStartTime(request.getScheduledStartTime())
                .scheduledEndTime(request.getScheduledEndTime())
                .primarySurgeon(surgeon)
                .anesthetist(anesthetist)
                .status(SurgeryStatus.SCHEDULED)
                .build();

        return scheduleRepository.save(schedule);
    }

    @Transactional
    public SurgerySchedule updateSurgeryStatus(UUID scheduleId, SurgeryStatus status) {
        SurgerySchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Surgery not found"));
        schedule.setStatus(status);
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public SurgicalNote addSurgicalNote(UUID scheduleId, SurgicalNoteRequest request, String username) {
        SurgerySchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Surgery not found"));
        User author = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Author not found"));

        SurgicalNote note = SurgicalNote.builder()
                .surgery(schedule)
                .author(author)
                .preOpDiagnosis(request.getPreOpDiagnosis())
                .postOpDiagnosis(request.getPostOpDiagnosis())
                .operationPerformed(request.getOperationPerformed())
                .surgeonNotes(request.getSurgeonNotes())
                .complications(request.getComplications())
                .build();

        return surgicalNoteRepository.save(note);
    }

    @Transactional
    public AnesthesiaNote addAnesthesiaNote(UUID scheduleId, AnesthesiaNoteRequest request, String username) {
        SurgerySchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Surgery not found"));
        User author = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Author not found"));

        AnesthesiaNote note = AnesthesiaNote.builder()
                .surgery(schedule)
                .author(author)
                .anesthesiaType(request.getAnesthesiaType())
                .medicationsAdministered(request.getMedicationsAdministered())
                .patientVitalsSummary(request.getPatientVitalsSummary())
                .anesthetistNotes(request.getAnesthetistNotes())
                .build();

        return anesthesiaNoteRepository.save(note);
    }
}
