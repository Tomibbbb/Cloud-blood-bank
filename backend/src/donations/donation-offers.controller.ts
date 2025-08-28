import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DonationOffersService } from './donation-offers.service';
import { CreateDonationOfferDto } from './dto/create-donation-offer.dto';
import { ConfirmDonationOfferDto } from './dto/confirm-donation-offer.dto';
import { RejectDonationOfferDto } from './dto/reject-donation-offer.dto';
import { DonationOfferQueryDto } from './dto/donation-offer-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('donations/offers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DonationOffersController {
  constructor(private readonly donationOffersService: DonationOffersService) {}

  @Post()
  @Roles(UserRole.DONOR)
  async createOffer(
    @Request() req,
    @Body() createOfferDto: CreateDonationOfferDto,
  ) {
    const offer = await this.donationOffersService.createOffer(
      req.user.sub,
      createOfferDto,
    );
    return {
      message: 'Donation offer created successfully',
      offer,
    };
  }

  @Get('mine')
  @Roles(UserRole.DONOR)
  async getMyOffers(@Request() req) {
    const offers = await this.donationOffersService.getMyOffers(req.user.sub);
    return {
      message: 'Offers retrieved successfully',
      offers,
    };
  }

  @Get('inbox')
  @Roles(UserRole.HOSPITAL)
  async getHospitalOffers(
    @Request() req,
    @Query() query: DonationOfferQueryDto,
  ) {
    const offers = await this.donationOffersService.getHospitalOffers(
      req.user.sub,
      query,
    );
    return {
      message: 'Hospital offers retrieved successfully',
      offers,
    };
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  async getAllOffers(@Query() query: DonationOfferQueryDto) {
    const offers = await this.donationOffersService.getAllOffers(query);
    const stats = await this.donationOffersService.getOfferStats();
    return {
      message: 'All offers retrieved successfully',
      offers,
      stats,
    };
  }

  @Patch(':id/confirm')
  @Roles(UserRole.HOSPITAL)
  @HttpCode(HttpStatus.OK)
  async confirmOffer(
    @Param('id') id: string,
    @Request() req,
    @Body() confirmDto: ConfirmDonationOfferDto,
  ) {
    const offer = await this.donationOffersService.confirmOffer(
      parseInt(id),
      req.user.sub,
      confirmDto,
    );
    return {
      message: 'Donation offer confirmed successfully',
      offer,
    };
  }

  @Patch(':id/reject')
  @Roles(UserRole.HOSPITAL)
  @HttpCode(HttpStatus.OK)
  async rejectOffer(
    @Param('id') id: string,
    @Request() req,
    @Body() rejectDto: RejectDonationOfferDto,
  ) {
    const offer = await this.donationOffersService.rejectOffer(
      parseInt(id),
      req.user.sub,
      rejectDto,
    );
    return {
      message: 'Donation offer rejected successfully',
      offer,
    };
  }

  @Patch(':id/cancel')
  @Roles(UserRole.DONOR)
  @HttpCode(HttpStatus.OK)
  async cancelOffer(@Param('id') id: string, @Request() req) {
    const offer = await this.donationOffersService.cancelOffer(
      parseInt(id),
      req.user.sub,
    );
    return {
      message: 'Donation offer cancelled successfully',
      offer,
    };
  }
}
