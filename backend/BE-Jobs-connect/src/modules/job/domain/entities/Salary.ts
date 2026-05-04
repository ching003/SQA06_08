export interface SalaryProps {
  id?: string;
  jobId: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  currency?: string | null;
  isNegotiable: boolean;
  hideAmount: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Salary {
  readonly id?: string;
  readonly jobId: string;
  readonly minAmount?: number | null;
  readonly maxAmount?: number | null;
  readonly currency?: string | null;
  readonly isNegotiable: boolean;
  readonly hideAmount: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: SalaryProps) {
    this.id = props.id;
    this.jobId = props.jobId;
    this.minAmount = props.minAmount;
    this.maxAmount = props.maxAmount;
    this.currency = props.currency ?? 'VND';
    this.isNegotiable = props.isNegotiable;
    this.hideAmount = props.hideAmount;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  with(props: Partial<SalaryProps>): Salary {
    return new Salary({
      id: this.id,
      jobId: props.jobId ?? this.jobId,
      minAmount: props.minAmount !== undefined ? props.minAmount : this.minAmount,
      maxAmount: props.maxAmount !== undefined ? props.maxAmount : this.maxAmount,
      currency: props.currency !== undefined ? props.currency : this.currency,
      isNegotiable: props.isNegotiable ?? this.isNegotiable,
      hideAmount: props.hideAmount ?? this.hideAmount,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
