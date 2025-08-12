import { PartialType } from '@nestjs/mapped-types';
import { CreateHospitalStockDto } from './create-hospital-stock.dto';

export class UpdateHospitalStockDto extends PartialType(CreateHospitalStockDto) {}