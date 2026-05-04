import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { companyService } from '../api/services';
import { CompanyMember, CompanyMemberInvitation } from '../lib/types';
import { toast } from 'sonner';

interface CompanyRealtimeContextType {
  members: CompanyMember[];
  invitations: CompanyMemberInvitation[];
  isLoading: boolean;
  refreshMembers: () => Promise<void>;
  refreshInvitations: (status?: string) => Promise<void>;
  lastUpdate: Date | null;
}

const CompanyRealtimeContext = createContext<CompanyRealtimeContextType | undefined>(undefined);

export function CompanyRealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyMemberInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentInvitationStatus, setCurrentInvitationStatus] = useState<string>('PENDING');

  // API returns company.id (nested) but frontend type expects companyId (flat)
  const companyId = user?.companyMember?.companyId || user?.companyMember?.company?.id;
  // API returns "role" but frontend type expects "companyRole"
  const memberRole = user?.companyMember?.companyRole || (user?.companyMember as any)?.role;
  const canManageMembers = memberRole === 'OWNER' || memberRole === 'MANAGER';

  // Fetch company members
  const refreshMembers = useCallback(async () => {
    if (!companyId) {
      setMembers([]);
      return;
    }

    try {
      const membersList = await companyService.getCompanyMembers(companyId);
      setMembers(membersList);
      setLastUpdate(new Date());
    } catch (error: any) {
      console.error('Failed to fetch company members:', error);
    }
  }, [companyId]);

  // Fetch company invitations
  const refreshInvitations = useCallback(async (status?: string) => {
    if (!companyId || !canManageMembers) {
      setInvitations([]);
      return;
    }

    const statusToFetch = status || currentInvitationStatus;
    if (status) {
      setCurrentInvitationStatus(status);
    }

    try {
      const invitationsList = await companyService.getCompanyInvitations(companyId, {
        status: statusToFetch,
      });
      setInvitations(invitationsList);
      setLastUpdate(new Date());
    } catch (error: any) {
      console.error('Failed to fetch company invitations:', error);
    }
  }, [companyId, canManageMembers, currentInvitationStatus]);

  // Initial data fetch when user logs in
  useEffect(() => {
    if (!companyId) {
      setMembers([]);
      setInvitations([]);
      return;
    }

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          refreshMembers(),
          canManageMembers ? refreshInvitations() : Promise.resolve()
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [companyId, canManageMembers]);

  // Firestore listener for company broadcast notifications
  // Path: /notifications/company/{companyId}
  // Types: MEMBER_JOINED, APPLICATION_RECEIVED, etc.
  useEffect(() => {
    if (!companyId) return;

    console.log('[CompanyRealtime] Setting up Firestore listener for company:', companyId);

    // Listen to company broadcast notifications
    const companyNotificationsRef = collection(db, 'notifications', 'company', companyId);

    const unsubscribeCompany = onSnapshot(
      companyNotificationsRef,
      (snapshot) => {
        const changes = snapshot.docChanges();
        if (changes.length > 0) {
          console.log('[CompanyRealtime] Company notifications changed:', changes.length, 'changes');
          
          changes.forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const notificationType = data.type;
              
              // Handle different notification types
              switch (notificationType) {
                case 'MEMBER_JOINED':
                  toast.success(`${data.memberName || 'Thành viên mới'} đã tham gia công ty!`);
                  refreshMembers();
                  refreshInvitations();
                  break;
                  
                case 'APPLICATION_RECEIVED':
                  toast.info(`Có đơn ứng tuyển mới cho vị trí ${data.jobTitle || ''}`);
                  break;
                  
                case 'INVITATION_ACCEPTED':
                  toast.success(`${data.userEmail || 'Thành viên'} đã chấp nhận lời mời!`);
                  refreshMembers();
                  refreshInvitations();
                  break;
                  
                case 'INVITATION_REJECTED':
                  toast.info(`${data.userEmail || 'Thành viên'} đã từ chối lời mời`);
                  refreshInvitations();
                  break;
                  
                default:
                  // Generic refresh for other types
                  refreshMembers();
                  refreshInvitations();
              }
            }
          });
        }
      },
      (error) => {
        console.error('[CompanyRealtime] Firestore company listener error:', error);
      }
    );

    return () => {
      console.log('[CompanyRealtime] Cleaning up Firestore company listener');
      unsubscribeCompany();
    };
  }, [companyId, refreshMembers, refreshInvitations]);

  return (
    <CompanyRealtimeContext.Provider
      value={{
        members,
        invitations,
        isLoading,
        refreshMembers,
        refreshInvitations,
        lastUpdate,
      }}
    >
      {children}
    </CompanyRealtimeContext.Provider>
  );
}

export function useCompanyRealtime() {
  const context = useContext(CompanyRealtimeContext);
  if (context === undefined) {
    throw new Error('useCompanyRealtime must be used within a CompanyRealtimeProvider');
  }
  return context;
}

