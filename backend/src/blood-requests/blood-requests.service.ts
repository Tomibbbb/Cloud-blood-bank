import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodRequest, RequestStatus } from './entities/blood-request.entity';
import { User } from '../users/entities/user.entity';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto';

@Injectable()
export class BloodRequestsService {
  constructor(
    @InjectRepository(BloodRequest)
    private bloodRequestRepository: Repository<BloodRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
}
