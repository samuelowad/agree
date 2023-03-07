import {
    IsBoolean,
    IsNotEmptyObject,
    IsObject,
    IsOptional,
    IsString
} from "class-validator";
import { User } from "../../users/entities/user.entity";

export class GetAllFarmDto {
    @IsBoolean()
    @IsOptional()
    public filterOutliers: boolean;

    @IsString()
    @IsOptional()
    public sortBy: string;

    @IsObject()
    @IsNotEmptyObject()
    public user: User;
}
