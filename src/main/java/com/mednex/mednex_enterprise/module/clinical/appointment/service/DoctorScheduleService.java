package com.mednex.mednex_enterprise.module.clinical.appointment.service;

import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.module.clinical.appointment.dto.DoctorScheduleDTO;
import com.mednex.mednex_enterprise.module.clinical.appointment.entity.DoctorSchedule;
import com.mednex.mednex_enterprise.module.clinical.appointment.repository.DoctorScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorScheduleService {

    private final DoctorScheduleRepository doctorScheduleRepository;

    public List<DoctorScheduleDTO> getDoctorSchedules(UUID doctorId) {
        return doctorScheduleRepository.findByDoctorIdAndActiveTrue(doctorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorScheduleDTO saveSchedule(User doctor, DoctorScheduleDTO dto) {
        DoctorSchedule schedule = convertToEntity(dto);
        schedule.setDoctor(doctor);
        return convertToDTO(doctorScheduleRepository.save(schedule));
    }

    @Transactional
    public void deleteSchedule(Long id) {
        doctorScheduleRepository.deleteById(id);
    }

    private DoctorScheduleDTO convertToDTO(DoctorSchedule entity) {
        return DoctorScheduleDTO.builder()
                .id(entity.getId())
                .dayOfWeek(entity.getDayOfWeek())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .slotDuration(entity.getSlotDuration())
                .active(entity.isActive())
                .build();
    }

    private DoctorSchedule convertToEntity(DoctorScheduleDTO dto) {
        return DoctorSchedule.builder()
                .id(dto.getId())
                .dayOfWeek(dto.getDayOfWeek())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .slotDuration(dto.getSlotDuration())
                .active(dto.isActive())
                .build();
    }
}
