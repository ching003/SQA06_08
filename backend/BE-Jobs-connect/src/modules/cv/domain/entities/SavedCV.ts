import type { User } from '@modules/user/domain/entities/User.js';
import type { CV } from './CV.js';

export interface SavedCVProps {
  id?: string;
  userId: string;
  cvId: string;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  cv?: CV;
}

export class SavedCV {
  readonly id?: string;
  readonly userId: string;
  readonly cvId: string;
  readonly notes?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly user?: User;
  readonly cv?: CV;

  constructor(props: SavedCVProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.cvId = props.cvId;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.user = props.user;
    this.cv = props.cv;
  }

  with(props: Partial<SavedCVProps>): SavedCV {
    return new SavedCV({
      id: this.id,
      userId: props.userId ?? this.userId,
      cvId: props.cvId ?? this.cvId,
      notes: props.notes !== undefined ? props.notes : this.notes,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      user: props.user !== undefined ? props.user : this.user,
      cv: props.cv !== undefined ? props.cv : this.cv,
    });
  }
}
