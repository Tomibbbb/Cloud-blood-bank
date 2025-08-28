import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

@Entity('hospital_stock')
export class HospitalStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hospitalId: number;

  @Column({
    type: 'enum',
    enum: BloodType,
  })
  bloodType: BloodType;

  @Column('int')
  unitsAvailable: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
