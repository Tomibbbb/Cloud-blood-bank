import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';
import {
  Donor,
  BloodType,
  DonorStatus,
} from '../../donors/entities/donor.entity';
import {
  BloodInventory,
  BloodGroup,
} from '../../blood-inventory/entities/blood-inventory.entity';
import {
  BloodRequest,
  RequestStatus,
  Priority,
} from '../../blood-requests/entities/blood-request.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Donor)
    private donorRepository: Repository<Donor>,
    @InjectRepository(BloodInventory)
    private inventoryRepository: Repository<BloodInventory>,
    @InjectRepository(BloodRequest)
    private requestRepository: Repository<BloodRequest>,
  ) {}

  async seed() {
    

    await this.clearDatabase();

    const users = await this.seedUsers();
    const donors = await this.seedDonors(users);
    await this.seedBloodInventory();
    await this.seedBloodRequests(users);

    
    
    
    
    
    
  }

  private async clearDatabase() {
    

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.query(
        'TRUNCATE TABLE "blood_requests" RESTART IDENTITY CASCADE;',
      );
      await queryRunner.query(
        'TRUNCATE TABLE "blood_inventory" RESTART IDENTITY CASCADE;',
      );
      await queryRunner.query(
        'TRUNCATE TABLE "donors" RESTART IDENTITY CASCADE;',
      );
      await queryRunner.query(
        'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async seedUsers(): Promise<User[]> {
    

    const hashedPassword = await bcrypt.hash(
      process.env.DEFAULT_SEED_PASSWORD || 'defaultpass',
      12,
    );

    const usersData = [
      {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@bloodbank.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        phone: '+1-555-0001',
        bloodType: 'O+',
        address: 'Blood Bank HQ, Medical District',
      },
      {
        firstName: 'City General',
        lastName: 'Hospital',
        email: 'admin@citygeneral.com',
        password: hashedPassword,
        role: UserRole.HOSPITAL,
        phone: '+1-555-0100',
        address: '123 Medical Center Dr, Downtown',
      },
      {
        firstName: 'St. Mary',
        lastName: 'Medical Center',
        email: 'requests@stmary.com',
        password: hashedPassword,
        role: UserRole.HOSPITAL,
        phone: '+1-555-0200',
        address: '456 Healthcare Ave, Uptown',
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        password: hashedPassword,
        role: UserRole.DONOR,
        phone: '+1-555-1001',
        bloodType: 'A+',
        address: '789 Elm Street, Suburbs',
        dateOfBirth: new Date('1985-03-15'),
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@email.com',
        password: hashedPassword,
        role: UserRole.DONOR,
        phone: '+1-555-1002',
        bloodType: 'O-',
        address: '321 Oak Avenue, Midtown',
        dateOfBirth: new Date('1990-07-22'),
      },
      {
        firstName: 'Michael',
        lastName: 'Davis',
        email: 'mike.davis@email.com',
        password: hashedPassword,
        role: UserRole.DONOR,
        phone: '+1-555-1003',
        bloodType: 'B+',
        address: '654 Pine Road, Eastside',
        dateOfBirth: new Date('1988-11-08'),
      },
      {
        firstName: 'Emily',
        lastName: 'Wilson',
        email: 'emily.w@email.com',
        password: hashedPassword,
        role: UserRole.DONOR,
        phone: '+1-555-1004',
        bloodType: 'AB-',
        address: '987 Maple Lane, Westside',
        dateOfBirth: new Date('1992-05-30'),
      },
      {
        firstName: 'Robert',
        lastName: 'Brown',
        email: 'rob.brown@email.com',
        password: hashedPassword,
        role: UserRole.DONOR,
        phone: '+1-555-1005',
        bloodType: 'A-',
        address: '147 Cedar Circle, Northside',
        dateOfBirth: new Date('1987-09-12'),
      },
    ];

    const users: User[] = [];
    for (const userData of usersData) {
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);
      users.push(savedUser);
    }

    
    return users;
  }

  private async seedDonors(users: User[]): Promise<Donor[]> {
    

    const donorUsers = users.filter((user) => user.role === UserRole.DONOR);
    const donors: Donor[] = [];

    const donorData = [
      {
        bloodType: BloodType.A_POSITIVE,
        weight: 75,
        height: 180,
        medicalHistory: 'No significant medical history',
        totalDonations: 8,
        lastDonationDate: new Date('2025-06-15'),
        emergencyContact: 'Jane Smith',
        emergencyPhone: '+1-555-2001',
      },
      {
        bloodType: BloodType.O_NEGATIVE,
        weight: 65,
        height: 165,
        medicalHistory: 'Vegetarian, takes iron supplements',
        totalDonations: 12,
        lastDonationDate: new Date('2025-05-28'),
        emergencyContact: 'Mark Johnson',
        emergencyPhone: '+1-555-2002',
      },
      {
        bloodType: BloodType.B_POSITIVE,
        weight: 82,
        height: 175,
        medicalHistory: 'Athletic, regular donor',
        totalDonations: 15,
        lastDonationDate: new Date('2025-07-10'),
        emergencyContact: 'Lisa Davis',
        emergencyPhone: '+1-555-2003',
      },
      {
        bloodType: BloodType.AB_NEGATIVE,
        weight: 58,
        height: 160,
        medicalHistory: 'Rare blood type, frequent plasma donor',
        totalDonations: 6,
        lastDonationDate: new Date('2025-04-20'),
        emergencyContact: 'Tom Wilson',
        emergencyPhone: '+1-555-2004',
      },
      {
        bloodType: BloodType.A_NEGATIVE,
        weight: 70,
        height: 172,
        medicalHistory: 'Teacher, volunteers regularly',
        totalDonations: 10,
        lastDonationDate: new Date('2025-06-05'),
        emergencyContact: 'Mary Brown',
        emergencyPhone: '+1-555-2005',
      },
    ];

    for (let i = 0; i < donorUsers.length; i++) {
      const donorProfile = this.donorRepository.create({
        userId: donorUsers[i].id,
        dateOfBirth: donorUsers[i].dateOfBirth,
        status: DonorStatus.ACTIVE,
        ...donorData[i],
      });

      const savedDonor = await this.donorRepository.save(donorProfile);
      donors.push(savedDonor);
    }

    
    return donors;
  }

  private async seedBloodInventory() {
    

    const inventoryData = [
      {
        bloodGroup: BloodGroup.A_POSITIVE,
        unitsAvailable: 25,
        location: 'City General Hospital',
        expiryDate: new Date('2025-09-15'),
      },
      {
        bloodGroup: BloodGroup.A_NEGATIVE,
        unitsAvailable: 12,
        location: 'City General Hospital',
        expiryDate: new Date('2025-09-20'),
      },
      {
        bloodGroup: BloodGroup.B_POSITIVE,
        unitsAvailable: 18,
        location: 'City General Hospital',
        expiryDate: new Date('2025-09-10'),
      },
      {
        bloodGroup: BloodGroup.B_NEGATIVE,
        unitsAvailable: 8,
        location: 'City General Hospital',
        expiryDate: new Date('2025-09-25'),
      },
      {
        bloodGroup: BloodGroup.O_POSITIVE,
        unitsAvailable: 35,
        location: 'City General Hospital',
        expiryDate: new Date('2025-09-12'),
      },
      {
        bloodGroup: BloodGroup.O_NEGATIVE,
        unitsAvailable: 15,
        location: 'City General Hospital',
        expiryDate: new Date('2025-09-18'),
      },
      {
        bloodGroup: BloodGroup.AB_POSITIVE,
        unitsAvailable: 10,
        location: 'City General Hospital',
        expiryDate: new Date('2025-09-22'),
      },
      {
        bloodGroup: BloodGroup.AB_NEGATIVE,
        unitsAvailable: 5,
        location: 'City General Hospital',
        expiryDate: new Date('2025-09-28'),
      },
    ];

    for (const inventory of inventoryData) {
      const inventoryRecord = this.inventoryRepository.create(inventory);
      await this.inventoryRepository.save(inventoryRecord);
    }

    
  }

  private async seedBloodRequests(users: User[]) {
    

    const hospitalUsers = users.filter(
      (user) => user.role === UserRole.HOSPITAL,
    );

    const requestData = [
      {
        bloodGroup: BloodGroup.O_NEGATIVE,
        unitsRequested: 4,
        priority: Priority.CRITICAL,
        status: RequestStatus.PENDING,
        reason: 'Emergency surgery - multiple trauma patient',
        patientName: 'Emergency Patient #1',
        patientAge: 35,
        requiredBy: new Date('2025-08-02'),
        notes: 'Urgent - patient in OR now',
        requestedById: hospitalUsers[0].id,
      },
      {
        bloodGroup: BloodGroup.A_POSITIVE,
        unitsRequested: 2,
        priority: Priority.HIGH,
        status: RequestStatus.APPROVED,
        reason: 'Scheduled cardiac surgery',
        patientName: 'John Patient',
        patientAge: 58,
        requiredBy: new Date('2025-08-05'),
        notes: 'Surgery scheduled for Friday morning',
        requestedById: hospitalUsers[1].id,
      },
      {
        bloodGroup: BloodGroup.B_POSITIVE,
        unitsRequested: 3,
        priority: Priority.MEDIUM,
        status: RequestStatus.FULFILLED,
        reason: 'Orthopedic surgery - hip replacement',
        patientName: 'Mary Patient',
        patientAge: 72,
        requiredBy: new Date('2025-08-08'),
        notes: 'Non-urgent scheduled procedure',
        requestedById: hospitalUsers[0].id,
      },
    ];

    for (const request of requestData) {
      const bloodRequest = this.requestRepository.create(request);
      await this.requestRepository.save(bloodRequest);
    }

    
  }
}
