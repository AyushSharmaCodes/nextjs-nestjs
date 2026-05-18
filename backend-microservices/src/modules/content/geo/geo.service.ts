import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Country, State, City, PinCode } from './entities/geo.entity';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(Country) private countryRepo: Repository<Country>,
    @InjectRepository(State) private stateRepo: Repository<State>,
    @InjectRepository(City) private cityRepo: Repository<City>,
    @InjectRepository(PinCode) private pinCodeRepo: Repository<PinCode>,
  ) {}

  async getCountries(search?: string) {
    if (search) {
      return this.countryRepo.find({ 
        where: { name: Like(`%${search}%`), isActive: true },
        order: { name: 'ASC' },
        take: 20 
      });
    }
    return this.countryRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async getCountryByCode(code: string) {
    return this.countryRepo.findOne({ where: { code, isActive: true } });
  }

  async getStates(countryId?: string, search?: string) {
    const where: any = { isActive: true };
    if (countryId) where.countryId = countryId;
    if (search) where.name = Like(`%${search}%`);
    return this.stateRepo.find({ where, order: { name: 'ASC' }, take: 50 });
  }

  async getStateByCode(code: string, countryId: string) {
    return this.stateRepo.findOne({ where: { code, countryId, isActive: true } });
  }

  async getCities(stateId?: string, countryId?: string, search?: string) {
    const where: any = { isActive: true };
    if (stateId) where.stateId = stateId;
    if (countryId) where.countryId = countryId;
    if (search) where.name = Like(`%${search}%`);
    return this.cityRepo.find({ where, order: { name: 'ASC' }, take: 50 });
  }

  async searchCities(query: string) {
    return this.cityRepo.find({
      where: { name: Like(`%${query}%`), isActive: true },
      order: { name: 'ASC' },
      take: 20,
    });
  }

  async getPinCode(code: string) {
    return this.pinCodeRepo.findOne({ where: { code, isActive: true } });
  }

  async searchPinCodes(query: string) {
    return this.pinCodeRepo.find({
      where: { code: Like(`${query}%`), isActive: true },
      order: { code: 'ASC' },
      take: 20,
    });
  }

  async searchLocation(query: string) {
    const cities = await this.searchCities(query);
    const pincodes = await this.searchPinCodes(query);
    return { cities, pincodes };
  }
}