import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Donor } from '../../donors/entities/donor.entity';
import { BloodGroup } from '../../blood-inventory/entities/blood-inventory.entity';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FULFILLED = 'fulfilled',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('blood_requests')
export class BloodRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BloodGroup,
  })
  bloodGroup: BloodGroup;

  @Column()
  unitsRequested: number;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column()
  reason: string;

  @Column()
  patientName: string;

  @Column()
  patientAge: number;

  @Column({ type: 'date' })
  requiredBy: Date;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requestedBy' })
  requestedBy: User;

  @Column()
  requestedById: number;

  @ManyToOne(() => Donor, { nullable: true })
  @JoinColumn({ name: 'requesterDonorId' })
  requesterDonor?: Donor;

  @Column({ nullable: true })
  requesterDonorId?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'hospitalId' })
  hospital?: User;

  @Column({ nullable: true })
  hospitalId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
