import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donor } from './entities/donor.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';

@Injectable()
export class DonorsService {
  constructor(
    @InjectRepository(Donor)
    private donorRepository: Repository<Donor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async registerDonor(
    createDonorDto: CreateDonorDto,
  ): Promise<{ donor: Donor; user: User }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createDonorDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = this.userRepository.create({
      firstName: createDonorDto.firstName,
      lastName: createDonorDto.lastName,
      email: createDonorDto.email,
      phone: createDonorDto.phone,
      address: createDonorDto.address,
      bloodType: createDonorDto.bloodType,
      role: UserRole.DONOR,
      password: 'temp_password_will_be_set_later',
    });

    const savedUser = await this.userRepository.save(newUser);

    const newDonor = this.donorRepository.create({
      userId: savedUser.id,
      bloodType: createDonorDto.bloodType,
      dateOfBirth: createDonorDto.dateOfBirth
        ? new Date(createDonorDto.dateOfBirth)
        : undefined,
      weight: createDonorDto.weight,
      height: createDonorDto.height,
      medicalHistory: createDonorDto.medicalHistory,
      emergencyContact: createDonorDto.emergencyContact,
      emergencyPhone: createDonorDto.emergencyPhone,
    });

    const savedDonor = await this.donorRepository.save(newDonor);

    return {
      user: savedUser,
      donor: savedDonor,
    };
  }

  async findDonorByUserId(userId: number): Promise<Donor> {
    const donor = await this.donorRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!donor) {
      throw new NotFoundException('Donor profile not found');
    }

    return donor;
  }

  async getAllDonors(): Promise<Donor[]> {
    return this.donorRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findDonorById(id: number): Promise<Donor> {
    const donor = await this.donorRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    return donor;
  }

  async updateDonor(
    id: number,
    updateDonorDto: UpdateDonorDto,
  ): Promise<Donor> {
    const donor = await this.findDonorById(id);

    Object.assign(donor, {
      ...updateDonorDto,
      dateOfBirth: updateDonorDto.dateOfBirth
        ? new Date(updateDonorDto.dateOfBirth)
        : donor.dateOfBirth,
      lastDonationDate: updateDonorDto.lastDonationDate
        ? new Date(updateDonorDto.lastDonationDate)
        : donor.lastDonationDate,
    });

    return this.donorRepository.save(donor);
  }
}
