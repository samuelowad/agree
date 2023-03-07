import { NextFunction, Request, Response } from "express";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { FarmsService } from "./farms.service";
import { GoogleMapHelper } from "helpers/google-map.helper";
import { FindFarmDto } from "./dto/find-farm.dto";
import { GetAllFarmDto } from "./dto/get-all-farm.dto";

export class FarmsController {
  private readonly farmsService: FarmsService;

  constructor() {
    this.farmsService = new FarmsService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {

    try {
      const farmDto = req.body as CreateFarmDto
      farmDto.coordinates = await GoogleMapHelper.getCoordinatesFromAddress(farmDto.address)

      const farm = await this.farmsService.createFarm(farmDto);
      res.status(201).send(farm);
    } catch (error) {
      next(error);
    }
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const getFarmDto  = req.body as GetAllFarmDto;
      const farm = await this.farmsService.getFarms(getFarmDto);
      res.status(200).send(farm);
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, id } : FindFarmDto = req.body as FindFarmDto;
      const farm = await this.farmsService.deleteFarm(user, id);
      res.status(200).send(farm);
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, id } : FindFarmDto = req.body as FindFarmDto;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const farm = await this.farmsService.updateFarm(user, id, {...req.body});
      res.status(200).send(farm);
    } catch (error) {
      next(error);
    }
  }
}
