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
import { BloodGroup } from '../../blood-inventory/entities/blood-inventory.entity';

export enum DonationStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BloodGroup,
  })
  bloodGroup: BloodGroup;

  @Column({ default: 1 })
  unitsDonated: number;

  @Column({
    type: 'enum',
    enum: DonationStatus,
    default: DonationStatus.SCHEDULED,
  })
  status: DonationStatus;

  @Column({ type: 'date' })
  donationDate: Date;

  @Column()
  donationCenter: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  hemoglobinLevel?: number;

  @Column({ nullable: true })
  bloodPressure?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number;

  @Column({ nullable: true })
  medicalNotes?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'donorId' })
  donor: User;

  @Column()
  donorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
