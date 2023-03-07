import { IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString } from "class-validator";
import { Point } from "geojson";
import { User } from "../../users/entities/user.entity";

export class CreateFarmDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public address: string;

  @IsNumber()
  @IsNotEmpty()
  public size: number;

  @IsNumber()
  @IsNotEmpty()
  public yield: number;

  @IsObject()
  @IsNotEmptyObject()
  public user: User;

  @IsNotEmpty()
  public coordinates: Point;
}
