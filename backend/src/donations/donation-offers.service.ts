import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  DonationOffer,
  DonationOfferStatus,
} from './entities/donation-offer.entity';
import { User } from '../users/entities/user.entity';
import { CreateDonationOfferDto } from './dto/create-donation-offer.dto';
import { ConfirmDonationOfferDto } from './dto/confirm-donation-offer.dto';
import { RejectDonationOfferDto } from './dto/reject-donation-offer.dto';
import { DonationOfferQueryDto } from './dto/donation-offer-query.dto';
import { OfferRoutingService } from './utils/routing.util';

@Injectable()
export class DonationOffersService {
  constructor(
    @InjectRepository(DonationOffer)
    private offerRepository: Repository<DonationOffer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private routingService: OfferRoutingService,
  ) {}

  async createOffer(
    userId: number,
    createOfferDto: CreateDonationOfferDto,
  ): Promise<DonationOffer> {
    const donor = await this.userRepository.findOne({ where: { id: userId } });
    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    const offer = new DonationOffer();
    offer.donorId = userId;
    offer.bloodType = createOfferDto.bloodType;
    offer.preferredDate = new Date(createOfferDto.preferredDate);
    offer.location = createOfferDto.location;
    offer.notes = createOfferDto.notes;
    offer.status = DonationOfferStatus.PENDING;
    const hospitals = await this.userRepository.find({
      where: { role: 'hospital' as any },
    });

    if (hospitals.length > 0) {
      offer.routedToId = hospitals[0].id;
      offer.routedToName = hospitals[0].firstName + ' ' + hospitals[0].lastName;
    }

    return this.offerRepository.save(offer);
  }

  async getMyOffers(userId: number): Promise<DonationOffer[]> {
    return this.offerRepository.find({
      where: { donorId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getHospitalOffers(
    hospitalId: number,
    query: DonationOfferQueryDto,
  ): Promise<DonationOffer[]> {
    const where: any = { routedToId: hospitalId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.bloodType) {
      where.bloodType = query.bloodType;
    }

    if (query.startDate && query.endDate) {
      where.preferredDate = Between(
        new Date(query.startDate),
        new Date(query.endDate),
      );
    }

    return this.offerRepository.find({
      where,
      relations: ['donor'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOffers(query: DonationOfferQueryDto): Promise<DonationOffer[]> {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.bloodType) {
      where.bloodType = query.bloodType;
    }

    if (query.startDate && query.endDate) {
      where.preferredDate = Between(
        new Date(query.startDate),
        new Date(query.endDate),
      );
    }

    if (query.hospitalId) {
      where.routedToId = parseInt(query.hospitalId);
    }

    return this.offerRepository.find({
      where,
      relations: ['donor'],
      order: { createdAt: 'DESC' },
    });
  }

  async confirmOffer(
    offerId: number,
    hospitalId: number,
    confirmDto: ConfirmDonationOfferDto,
  ): Promise<DonationOffer> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId, routedToId: hospitalId },
    });

    if (!offer) {
      throw new NotFoundException('Donation offer not found');
    }

    if (offer.status !== DonationOfferStatus.PENDING) {
      throw new BadRequestException('Can only confirm pending offers');
    }

    offer.status = DonationOfferStatus.CONFIRMED;
    offer.appointmentDate = new Date(confirmDto.appointmentDate);
    offer.hospitalNotes = confirmDto.hospitalNotes;

    return this.offerRepository.save(offer);
  }

  async rejectOffer(
    offerId: number,
    hospitalId: number,
    rejectDto: RejectDonationOfferDto,
  ): Promise<DonationOffer> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId, routedToId: hospitalId },
    });

    if (!offer) {
      throw new NotFoundException('Donation offer not found');
    }

    if (offer.status !== DonationOfferStatus.PENDING) {
      throw new BadRequestException('Can only reject pending offers');
    }

    offer.status = DonationOfferStatus.REJECTED;
    offer.rejectionReason = rejectDto.rejectionReason;

    return this.offerRepository.save(offer);
  }

  async cancelOffer(offerId: number, donorId: number): Promise<DonationOffer> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId, donorId },
    });

    if (!offer) {
      throw new NotFoundException('Donation offer not found');
    }

    if (offer.status !== DonationOfferStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending offers');
    }

    offer.status = DonationOfferStatus.CANCELLED;
    return this.offerRepository.save(offer);
  }

  async getOfferStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    rejected: number;
  }> {
    const [total, pending, confirmed, rejected] = await Promise.all([
      this.offerRepository.count(),
      this.offerRepository.count({
        where: { status: DonationOfferStatus.PENDING },
      }),
      this.offerRepository.count({
        where: { status: DonationOfferStatus.CONFIRMED },
      }),
      this.offerRepository.count({
        where: { status: DonationOfferStatus.REJECTED },
      }),
    ]);

    return { total, pending, confirmed, rejected };
  }
}
