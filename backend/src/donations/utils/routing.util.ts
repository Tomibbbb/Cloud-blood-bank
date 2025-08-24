import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { BloodInventory } from '../../blood-inventory/entities/blood-inventory.entity';

export interface RoutingResult {
  hospitalId: number;
  hospitalName: string;
}

@Injectable()
export class OfferRoutingService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BloodInventory)
    private inventoryRepository: Repository<BloodInventory>,
  ) {}

  async routeOffer(donorLocation: string, bloodType: string): Promise<RoutingResult | null> {
    const hospitals = await this.userRepository.find({
      where: { role: UserRole.HOSPITAL },
    });

    if (hospitals.length === 0) {
      return null;
    }

    const lowStockHospital = await this.findLowStockHospital(bloodType, hospitals);
    if (lowStockHospital) {
      return lowStockHospital;
    }

    const nearestHospital = this.findNearestHospital(donorLocation, hospitals);
    return nearestHospital;
  }

  private async findLowStockHospital(bloodType: string, hospitals: User[]): Promise<RoutingResult | null> {
    const lowStockThreshold = 20;

    for (const hospital of hospitals) {
      const inventory = await this.inventoryRepository.findOne({
        where: {
          bloodGroup: this.mapBloodTypeToGroup(bloodType),
          location: hospital.firstName + ' ' + hospital.lastName,
        },
      });

      if (inventory && inventory.unitsAvailable < lowStockThreshold) {
        return {
          hospitalId: hospital.id,
          hospitalName: hospital.firstName + ' ' + hospital.lastName,
        };
      }
    }

    return null;
  }

  private findNearestHospital(donorLocation: string, hospitals: User[]): RoutingResult {
    const locationPriority = this.getLocationPriority(donorLocation.toLowerCase());
    
    for (const hospital of hospitals) {
      const hospitalLocation = (hospital.address || '').toLowerCase();
      if (hospitalLocation.includes(locationPriority)) {
        return {
          hospitalId: hospital.id,
          hospitalName: hospital.firstName + ' ' + hospital.lastName,
        };
      }
    }

    const defaultHospital = hospitals[0];
    return {
      hospitalId: defaultHospital.id,
      hospitalName: defaultHospital.firstName + ' ' + defaultHospital.lastName,
    };
  }

  private getLocationPriority(location: string): string {
    const cityKeywords = ['london', 'manchester', 'birmingham', 'leeds', 'glasgow'];
    
    for (const city of cityKeywords) {
      if (location.includes(city)) {
        return city;
      }
    }
    
    return location.split(' ')[0] || location;
  }

  private mapBloodTypeToGroup(bloodType: string): any {
    const mapping: { [key: string]: any } = {
      'A+': 'A_POSITIVE',
      'A-': 'A_NEGATIVE',
      'B+': 'B_POSITIVE',
      'B-': 'B_NEGATIVE',
      'AB+': 'AB_POSITIVE',
      'AB-': 'AB_NEGATIVE',
      'O+': 'O_POSITIVE',
      'O-': 'O_NEGATIVE',
    };
    return mapping[bloodType] || 'O_POSITIVE';
  }
}