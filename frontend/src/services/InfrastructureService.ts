import { apiClient } from './api.client';
import type { 
    BuildingDTO, 
    FloorDTO, 
    RoomDTO, 
    WardMapDTO, 
    WardDTO,
    BedStatus, 
    MedicalAssetDTO 
} from './api.types';

const InfrastructureService = {
    // Admin Infrastructure Management
    getBuildings: async (branchId: string): Promise<BuildingDTO[]> => {
        const response = await apiClient.get<BuildingDTO[]>(`/v1/admin/infrastructure/buildings`, { params: { branchId } });
        return response.data;
    },
    
    createBuilding: async (data: Partial<BuildingDTO>): Promise<BuildingDTO> => {
        const response = await apiClient.post<BuildingDTO>('/v1/admin/infrastructure/buildings', data);
        return response.data;
    },
    
    getFloors: async (buildingId: string): Promise<FloorDTO[]> => {
        const response = await apiClient.get<FloorDTO[]>(`/v1/admin/infrastructure/buildings/${buildingId}/floors`);
        return response.data;
    },
    
    createFloor: async (data: Partial<FloorDTO>): Promise<FloorDTO> => {
        const response = await apiClient.post<FloorDTO>('/v1/admin/infrastructure/floors', data);
        return response.data;
    },
    
    createRoom: async (data: Partial<RoomDTO>): Promise<RoomDTO> => {
        const response = await apiClient.post<RoomDTO>('/v1/admin/infrastructure/rooms', data);
        return response.data;
    },

    // Asset Management
    registerAsset: async (data: Partial<MedicalAssetDTO>): Promise<MedicalAssetDTO> => {
        const response = await apiClient.post<MedicalAssetDTO>('/v1/admin/infrastructure/assets', data);
        return response.data;
    },

    // Receptionist Portals
    getWards: async (branchId: string): Promise<WardDTO[]> => {
        const response = await apiClient.get<WardDTO[]>(`/v1/receptionist/wards`, { params: { branchId } });
        return response.data;
    },

    // Receptionist Bed Map (The Matrix)
    getWardMap: async (wardId: string): Promise<WardMapDTO> => {
        const response = await apiClient.get<WardMapDTO>(`/v1/receptionist/bed-map/${wardId}`);
        return response.data;
    },
    
    updateBedStatus: async (bedId: string, status: BedStatus): Promise<void> => {
        await apiClient.patch(`/v1/receptionist/bed-map/beds/${bedId}/status`, null, { params: { status } });
    },
    
    updateBedCoordinates: async (bedId: string, x: number, y: number): Promise<void> => {
        await apiClient.patch(`/v1/receptionist/bed-map/beds/${bedId}/coordinates`, null, { params: { x, y } });
    },

    // Support Workflows
    requestCleaning: async (bedId: string, priority: string): Promise<void> => {
        await apiClient.post('/v1/support/cleaning-request', null, { params: { bedId, priority } });
    },
    
    completeCleaning: async (taskId: string): Promise<void> => {
        await apiClient.post(`/v1/support/cleaning-tasks/${taskId}/complete`);
    },
    
    requestMaintenance: async (assetId: string, description: string, priority: string): Promise<void> => {
        await apiClient.post('/v1/support/maintenance-request', null, { params: { assetId, description, priority } });
    }
};

export default InfrastructureService;
