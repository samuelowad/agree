import { MigrationInterface, QueryRunner } from "typeorm"

import { UsersService } from "modules/users/users.service";
import { FarmsService } from "modules/farms/farms.service";
import { User } from "modules/users/entities/user.entity";
import { Farm } from "modules/farms/entities/farm.entity";
import { GoogleMapHelper } from "helpers/google-map.helper";
import { faker } from "@faker-js/faker";
import { CreateUserDto } from "../../users/dto/create-user.dto";



export class addUserAndFarmSeed1678076405009 implements MigrationInterface {
    // eslint-disable-next-line no-unused-vars
    public async up(_queryRunner: QueryRunner): Promise<void> {
        await this.seedData();
    }

    // eslint-disable-next-line no-unused-vars,@typescript-eslint/require-await
    public async down(_queryRunner: QueryRunner): Promise<void> {
        return ;
    }

    private async seedData() {
        const addresses = [  "138 Narrows Rd, Remlap, Alabama 35133, USA",  "746 E Main St, Headland, Alabama 36345, USA",  "Po Box 504, Cottonwood, Alabama 36320, USA",  "138 Sam Aaron Rd, Nauvoo, Alabama 35578, USA",  "109 Bentmoor Cir, Helena, Alabama 35080, USA",  "717 Parker St, Union Springs, Alabama 36089, USA",  "650 Rr 1, Butler, Alabama 36904, USA",  "3000 Lee Dr #10, Auburn, Alabama 36832, USA",  "138 Willow Point Dr, Ohatchee, Alabama 36271, USA",  "2921 Ashley Ave, Montgomery, Alabama 36109, USA",  "3343 Chapel Hills Pkwy, Fultondale, Alabama 35068, USA",  "Po Box 573, Tanner, Alabama 35671, USA",  "138 Marshall Johnson Rd, Moundville, Alabama 35474, USA",  "607 Carpenter Way, Auburn, Alabama 36830, USA",  "138 Narrows Rd #15, Remlap, Alabama 35133, USA"]

        const userService = new UsersService();
        const farmService = new FarmsService();

        const users: User[] = [];
        const farms: Farm[] = [];

        // create 4 users
        for (let i = 1; i <= 4; i++) {
            const email = faker.internet.email();
            const password = faker.internet.password();
            const address = addresses[Math.floor(Math.random() * addresses.length)];

            const coordinates = await GoogleMapHelper.getCoordinatesFromAddress(address);
            const userDto :CreateUserDto = { email, password, address, coordinates };

            const user = await userService.createUser(userDto);
            users.push(user);

            // create 30 farms for each user
            for (let j = 1; j <= 30; j++) {
                const address = addresses[Math.floor(Math.random() * addresses.length)];
                const coordinates = await GoogleMapHelper.getCoordinatesFromAddress(address);
                const name = faker.company.name();
                const size = Math.floor(Math.random() * (100 - 10 + 1) + 10);
                const yieldAmount = Math.floor(Math.random() * (15 - 5 + 1) + 5);

                const farm = await farmService.createFarm({
                    name,
                    address,
                    coordinates,
                    size,
                    yield: yieldAmount,
                    user
                });
                farms.push(farm);
            }
        }

        console.log(`Seeded ${users.length} users and ${farms.length} farms`);
    }


}
