import {IsEmail, IsEmpty, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {Point} from "geojson";

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public password: string;

  @IsString()
  @IsNotEmpty()
  public address: string;

  @IsEmpty()
  @IsOptional()
  public coordinates: Point;
}
