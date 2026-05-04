export interface GetRecentActivitiesInputDTO {
    limit?: number; // default 10
}

export interface ActivityDTO {
    id: string;
    type: 'company_registered' | 'company_approved' | 'company_rejected' | 'job_posted' | 'application' | 'user_registered';
    title: string;
    description: string;
    timestamp: Date;
}

export interface GetRecentActivitiesOutputDTO {
    activities: ActivityDTO[];
}
