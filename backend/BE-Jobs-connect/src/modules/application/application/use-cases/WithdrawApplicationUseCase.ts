import type { IApplicationRepository } from '../../domain/repositories/IApplicationRepository.js';
import type { WithdrawApplicationInputDTO, WithdrawApplicationOutputDTO } from '../dtos/ApplicationDTO.js';
import { mapApplicationToOutput } from '../helpers/index.js';
import { ApplicationStatus } from '../../domain/enums/index.js';

interface Dependencies {
  applicationRepository: IApplicationRepository;
}

export class WithdrawApplicationUseCase {
  private readonly applicationRepository: IApplicationRepository;

  constructor({ applicationRepository }: Dependencies) {
    this.applicationRepository = applicationRepository;
  }

  async execute(input: WithdrawApplicationInputDTO): Promise<WithdrawApplicationOutputDTO> {
    const { applicationId, userId } = input;

    const application = await this.applicationRepository.findByIdWithRelations(applicationId);

    if (!application) {
      throw new Error('Application not found');
    }

    // Check permission: only the applicant can withdraw their application
    if (application.userId !== userId) {
      throw new Error('You do not have permission to withdraw this application');
    }

    // Check if application can be withdrawn
    if (!application.canBeWithdrawn()) {
      throw new Error('Chỉ có thể rút đơn ứng tuyển khi đơn đang ở trạng thái chờ xử lý');
    }

    const updatedApplication = await this.applicationRepository.update(applicationId, {
      status: ApplicationStatus.CANCELLED,
    });

    const applicationWithRelations = await this.applicationRepository.findByIdWithRelations(updatedApplication.id!);

    return mapApplicationToOutput(applicationWithRelations);
  }
}
