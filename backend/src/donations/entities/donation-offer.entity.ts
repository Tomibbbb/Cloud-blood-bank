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

export enum DonationOfferStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('donation_offers')
export class DonationOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'donorId' })
  donor: User;

  @Column()
  donorId: number;

  @Column()
  bloodType: string;

  @Column({ type: 'timestamp' })
  preferredDate: Date;

  @Column()
  location: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({
    type: 'enum',
    enum: DonationOfferStatus,
    default: DonationOfferStatus.PENDING,
  })
  status: DonationOfferStatus;

  @Column({ nullable: true })
  routedToId?: number;

  @Column({ nullable: true })
  routedToName?: string;

  @Column({ type: 'timestamp', nullable: true })
  appointmentDate?: Date;

  @Column({ type: 'text', nullable: true })
  hospitalNotes?: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
