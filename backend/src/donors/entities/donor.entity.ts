import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum DonorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('donors')
export class Donor {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: BloodType,
  })
  bloodType: BloodType;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  weight?: number;

  @Column({ nullable: true })
  height?: number;

  @Column({ nullable: true })
  medicalHistory?: string;

  @Column({ type: 'date', nullable: true })
  lastDonationDate?: Date;

  @Column({ default: 0 })
  totalDonations: number;

  @Column({
    type: 'enum',
    enum: DonorStatus,
    default: DonorStatus.ACTIVE,
  })
  status: DonorStatus;

  @Column({ nullable: true })
  emergencyContact?: string;

  @Column({ nullable: true })
  emergencyPhone?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
