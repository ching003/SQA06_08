import client from '../client';
import { GetRecentActivitiesResponse } from '../../lib/types';

export const adminService = {
    getRecentActivities: async (limit = 10): Promise<GetRecentActivitiesResponse> => {
        const response = await client.get<GetRecentActivitiesResponse>('/api/users/admin/activities/recent', {
            params: { limit },
        });
        return response.data;
    },
};
