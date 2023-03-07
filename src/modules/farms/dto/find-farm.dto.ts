import { IsNotEmpty, IsNotEmptyObject, IsObject, IsString } from "class-validator";
import { User } from "../../users/entities/user.entity";

export class FindFarmDto {
    @IsString()
    @IsNotEmpty()
    public id: string;

    @IsObject()
    @IsNotEmptyObject()
    public user: User;
}
