import { UnprocessableEntityError } from "errors/errors";
import { FindOptionsWhere, Repository } from "typeorm";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { Farm } from "./entities/farm.entity";
import dataSource from "orm/orm.config";
import { User } from "../users/entities/user.entity";
import { GoogleMapHelper } from "helpers/google-map.helper";
import { GetAllFarmDto } from "./dto/get-all-farm.dto";

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
  }

  public async createFarm(data: CreateFarmDto): Promise<Farm> {

    try{
    const existingFarm = await this.findOneBy({ name:data.name });
    if (existingFarm) throw new UnprocessableEntityError("A farm with the same name already exists");

    const newFarm = this.farmsRepository.create(data);
    return await this.farmsRepository.save(newFarm);
    } catch (error) {
      throw error;
    }
  }

  public async findOneBy(param: FindOptionsWhere<Farm>): Promise<Farm | null> {
    return this.farmsRepository.findOneBy({ ...param });
  }

  public async deleteFarm(user:User, id: string): Promise<void> {
    try {
      const farm = await this.findFarmByUserId(user, id);
      if(!farm) throw new Error("Farm not found")

      await this.farmsRepository.remove(farm)
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  public async updateFarm(user: User, id: string, updateData: Partial<Farm>): Promise<Farm> {
    try {
      const farm = await this.findFarmByUserId(user, id);
      if (!farm) throw new Error("Farm not found");

      const updatedFarm = Object.assign(farm, updateData);
      return await this.farmsRepository.save(updatedFarm);
    } catch (error) {
      throw error;
    }
  }

  public async getFarms(
      data:GetAllFarmDto
  ): Promise<Farm[]> {
    const { user, sortBy, filterOutliers } = data;

    const farms = await this.farmsRepository
        .createQueryBuilder("farm")
        .leftJoin("farm.user", "user")
        .addSelect(["user.email"] )
        .getMany();

    const farmsWithDistance = await Promise.all(

        farms.map(async (farm) => {
          //Hack: cant seem to return user.email as owner, return it here
            // @ts-ignore
          farm["owner"] = farm.user.email;
          // @ts-ignore
          delete farm.user;

          let distanceMatrix;
          if ("coordinates" in farm.coordinates && "coordinates" in user.coordinates) {
            distanceMatrix = await GoogleMapHelper.distancesMatrix({
              origins: [`${user.coordinates.coordinates[1]},${user.coordinates.coordinates[0]}`],
              destinations: [
                `${farm.coordinates.coordinates[1]},${farm.coordinates.coordinates[0]}`,
              ],
            });
          }
          const drivingDistance = `${distanceMatrix} meters`;
          return {
            ...farm,
            drivingDistance,
          };
        }),
    );

    if (filterOutliers) {
      const averageYield =
          farmsWithDistance.reduce((total: any, farm: { yield: any; }) => total + farm.yield, 0) /
          farmsWithDistance.length;
      const threshold = averageYield * 0.3;
      farmsWithDistance.filter((farm: { yield: number; }) => {
        const deviation = Math.abs(farm.yield - averageYield);
        return deviation <= threshold;
      });
    }

    if (sortBy === "name") {
      farmsWithDistance.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "date") {
      farmsWithDistance.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === "drivingDistance") {
      farmsWithDistance.sort((a, b) => {
        // @ts-ignore
        const aDistance = Number(a.drivingDistance.match(/\d+/)[0]);
        // @ts-ignore
        const bDistance = Number(b.drivingDistance.match(/\d+/)[0]);
        return aDistance - bDistance;
      });
    }

    return farmsWithDistance;
  }

  private async findFarmByUserId(user:User, id:string): Promise<Farm | null> {
    return this.farmsRepository.createQueryBuilder("farm")
        .leftJoin("farm.user", "user")
        .where("farm.id = :id AND user.id = :userId", { id, userId: user.id })
        .getOne()
  }

}
