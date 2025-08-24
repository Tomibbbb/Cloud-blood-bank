import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodRequest, RequestStatus, Priority } from './entities/blood-request.entity';
import { User } from '../users/entities/user.entity';
import { Donor } from '../donors/entities/donor.entity';
import { Donation, DonationStatus } from '../donations/entities/donation.entity';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto';
import { CreateDonorBloodRequestDto } from './dto/create-donor-blood-request.dto';

@Injectable()
export class BloodRequestsService {
  constructor(
    @InjectRepository(BloodRequest)
    private bloodRequestRepository: Repository<BloodRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Donor)
    private donorRepository: Repository<Donor>,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  async createRequest(createBloodRequestDto: CreateBloodRequestDto, userId: number): Promise<BloodRequest> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newRequest = this.bloodRequestRepository.create({
      bloodGroup: createBloodRequestDto.bloodType,
      unitsRequested: createBloodRequestDto.quantity,
      priority: createBloodRequestDto.urgency,
      reason: createBloodRequestDto.reason,
      patientName: createBloodRequestDto.patientName,
      patientAge: createBloodRequestDto.patientAge,
      requiredBy: new Date(createBloodRequestDto.requiredBy),
      notes: createBloodRequestDto.notes,
      requestedById: userId,
      status: RequestStatus.PENDING
    });

    return this.bloodRequestRepository.save(newRequest);
  }

  async getAllRequests(): Promise<BloodRequest[]> {
    return this.bloodRequestRepository.find({
      relations: ['requestedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async getRequestsByHospital(hospitalId: number): Promise<BloodRequest[]> {
    return this.bloodRequestRepository.find({
      where: { requestedById: hospitalId },
      relations: ['requestedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateRequestStatus(requestId: number, status: RequestStatus): Promise<BloodRequest> {
    const request = await this.bloodRequestRepository.findOne({
      where: { id: requestId },
      relations: ['requestedBy']
    });

    if (!request) {
      throw new NotFoundException('Blood request not found');
    }

    request.status = status;
    return this.bloodRequestRepository.save(request);
  }

  async createDonorBloodRequest(createDonorBloodRequestDto: CreateDonorBloodRequestDto, userId: number): Promise<BloodRequest> {
    const donor = await this.donorRepository.findOne({
      where: { userId: userId }
    });

    if (!donor) {
      throw new NotFoundException('Donor profile not found');
    }

    const completedDonations = await this.donationRepository.count({
      where: { 
        donorId: userId,
        status: DonationStatus.COMPLETED
      }
    });

    if (completedDonations === 0) {
      throw new ForbiddenException('Only donors with at least one prior donation may request blood');
    }

    const newRequest = this.bloodRequestRepository.create({
      requesterDonorId: donor.id,
      hospitalId: createDonorBloodRequestDto.preferredHospitalId || undefined,
      bloodGroup: createDonorBloodRequestDto.bloodType,
      unitsRequested: createDonorBloodRequestDto.units,
      reason: createDonorBloodRequestDto.reason || 'Blood request from donor',
      status: RequestStatus.PENDING,
      priority: Priority.HIGH,
      requestedById: userId,
      patientName: 'Donor Request',
      patientAge: 0,
      requiredBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return this.bloodRequestRepository.save(newRequest);
  }
}
