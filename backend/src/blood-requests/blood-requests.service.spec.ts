import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BloodRequestsService } from './blood-requests.service';
import { BloodRequest, RequestStatus, Priority } from './entities/blood-request.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Donor } from '../donors/entities/donor.entity';
import { Donation, DonationStatus } from '../donations/entities/donation.entity';
import { BloodGroup } from '../blood-inventory/entities/blood-inventory.entity';
import { CreateDonorBloodRequestDto } from './dto/create-donor-blood-request.dto';

describe('BloodRequestsService', () => {
  let service: BloodRequestsService;
  let bloodRequestRepository: Repository<BloodRequest>;
  let userRepository: Repository<User>;
  let donorRepository: Repository<Donor>;
  let donationRepository: Repository<Donation>;

  const mockBloodRequestRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockDonorRepository = {
    findOne: jest.fn(),
  };

  const mockDonationRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloodRequestsService,
        {
          provide: getRepositoryToken(BloodRequest),
          useValue: mockBloodRequestRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Donor),
          useValue: mockDonorRepository,
        },
        {
          provide: getRepositoryToken(Donation),
          useValue: mockDonationRepository,
        },
      ],
    }).compile();

    service = module.get<BloodRequestsService>(BloodRequestsService);
    bloodRequestRepository = module.get<Repository<BloodRequest>>(getRepositoryToken(BloodRequest));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    donorRepository = module.get<Repository<Donor>>(getRepositoryToken(Donor));
    donationRepository = module.get<Repository<Donation>>(getRepositoryToken(Donation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDonorBloodRequest', () => {
    const mockUserId = 1;
    const mockDonorId = 1;
    const mockDto: CreateDonorBloodRequestDto = {
      bloodType: BloodGroup.A_POSITIVE,
      units: 2,
      reason: 'Medical treatment',
      preferredHospitalId: 1,
    };

    const mockDonor = {
      id: mockDonorId,
      userId: mockUserId,
    };

    const mockBloodRequest = {
      id: 1,
      requesterDonorId: mockDonorId,
      hospitalId: 1,
      bloodGroup: BloodGroup.A_POSITIVE,
      unitsRequested: 2,
      reason: 'Medical treatment',
      status: RequestStatus.PENDING,
      priority: Priority.HIGH,
      requestedById: mockUserId,
    };

    it('should create a blood request for donor with completed donations', async () => {
      mockDonorRepository.findOne.mockResolvedValue(mockDonor);
      mockDonationRepository.count.mockResolvedValue(1); // Has completed donations
      mockBloodRequestRepository.create.mockReturnValue(mockBloodRequest);
      mockBloodRequestRepository.save.mockResolvedValue(mockBloodRequest);

      const result = await service.createDonorBloodRequest(mockDto, mockUserId);

      expect(mockDonorRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      });
      expect(mockDonationRepository.count).toHaveBeenCalledWith({
        where: { 
          donorId: mockUserId,
          status: DonationStatus.COMPLETED
        }
      });
      expect(mockBloodRequestRepository.create).toHaveBeenCalledWith({
        requesterDonorId: mockDonorId,
        hospitalId: 1,
        bloodGroup: BloodGroup.A_POSITIVE,
        unitsRequested: 2,
        reason: 'Medical treatment',
        status: RequestStatus.PENDING,
        priority: Priority.HIGH,
        requestedById: mockUserId,
        patientName: 'Donor Request',
        patientAge: 0,
        requiredBy: expect.any(Date),
      });
      expect(mockBloodRequestRepository.save).toHaveBeenCalledWith(mockBloodRequest);
      expect(result).toEqual(mockBloodRequest);
    });

    it('should throw NotFoundException when donor profile not found', async () => {
      mockDonorRepository.findOne.mockResolvedValue(null);

      await expect(service.createDonorBloodRequest(mockDto, mockUserId))
        .rejects.toThrow(NotFoundException);
      
      expect(mockDonorRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      });
      expect(mockDonationRepository.count).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when donor has no completed donations', async () => {
      mockDonorRepository.findOne.mockResolvedValue(mockDonor);
      mockDonationRepository.count.mockResolvedValue(0); // No completed donations

      await expect(service.createDonorBloodRequest(mockDto, mockUserId))
        .rejects.toThrow(ForbiddenException);
      
      expect(mockDonorRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      });
      expect(mockDonationRepository.count).toHaveBeenCalledWith({
        where: { 
          donorId: mockUserId,
          status: DonationStatus.COMPLETED
        }
      });
      expect(mockBloodRequestRepository.create).not.toHaveBeenCalled();
    });

    it('should create request with null hospitalId when not provided', async () => {
      const dtoWithoutHospital = { ...mockDto };
      delete dtoWithoutHospital.preferredHospitalId;

      mockDonorRepository.findOne.mockResolvedValue(mockDonor);
      mockDonationRepository.count.mockResolvedValue(1);
      mockBloodRequestRepository.create.mockReturnValue(mockBloodRequest);
      mockBloodRequestRepository.save.mockResolvedValue(mockBloodRequest);

      await service.createDonorBloodRequest(dtoWithoutHospital, mockUserId);

      expect(mockBloodRequestRepository.create).toHaveBeenCalledWith({
        requesterDonorId: mockDonorId,
        hospitalId: undefined,
        bloodGroup: BloodGroup.A_POSITIVE,
        unitsRequested: 2,
        reason: 'Medical treatment',
        status: RequestStatus.PENDING,
        priority: Priority.HIGH,
        requestedById: mockUserId,
        patientName: 'Donor Request',
        patientAge: 0,
        requiredBy: expect.any(Date),
      });
    });

    it('should use default reason when not provided', async () => {
      const dtoWithoutReason = { ...mockDto };
      delete dtoWithoutReason.reason;

      mockDonorRepository.findOne.mockResolvedValue(mockDonor);
      mockDonationRepository.count.mockResolvedValue(1);
      mockBloodRequestRepository.create.mockReturnValue(mockBloodRequest);
      mockBloodRequestRepository.save.mockResolvedValue(mockBloodRequest);

      await service.createDonorBloodRequest(dtoWithoutReason, mockUserId);

      expect(mockBloodRequestRepository.create).toHaveBeenCalledWith({
        requesterDonorId: mockDonorId,
        hospitalId: 1,
        bloodGroup: BloodGroup.A_POSITIVE,
        unitsRequested: 2,
        reason: 'Blood request from donor',
        status: RequestStatus.PENDING,
        priority: Priority.HIGH,
        requestedById: mockUserId,
        patientName: 'Donor Request',
        patientAge: 0,
        requiredBy: expect.any(Date),
      });
    });
  });
});