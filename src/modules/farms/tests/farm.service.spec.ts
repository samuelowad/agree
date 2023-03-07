import config from "config/config";
import { UnprocessableEntityError } from "errors/errors";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { User } from "modules/users/entities/user.entity";
import { FarmsService } from "../farms.service";
import { Point } from "geojson";
import { faker } from "@faker-js/faker";
import { UsersService } from "../../users/users.service";
import { Farm } from "../entities/farm.entity";

describe("FarmsService", () => {
  let app: Express;
  let server: Server;

  let farmsService: FarmsService;
  // @ts-ignore
  let usersService: UsersService;

  const coordinates :Point = {type: "Point", coordinates: [0, 0]};
  const address = "address";
  const name = faker.company.name();
  const size = Math.floor(Math.random() * (100 - 10 + 1) + 10);
  const yieldAmount = Math.floor(Math.random() * (15 - 5 + 1) + 5);
  // @ts-ignore
  let user: User ;

  beforeAll(() => {
    app = setupServer();
    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    await ds.initialize();
    farmsService = new FarmsService();
    usersService = new UsersService();
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe(".createFarm",  () => {

    const createFarmDto:CreateFarmDto = { name, size, yield:yieldAmount, address, coordinates, user };

    it("should create new farm", async () => {
      createFarmDto.user = await usersService.createUser({ email: "user@test.com", password: "password", address: "address", coordinates })

      const createdFarm = await farmsService.createFarm(createFarmDto);
      expect(createdFarm).toBeInstanceOf(Farm);
      expect(createdFarm).toMatchObject(
          { name: createFarmDto.name, size: createFarmDto.size,
            yield: createFarmDto.yield, address: createFarmDto.address,
            coordinates: createFarmDto.coordinates, user: createFarmDto.user });
    });

    describe("with existing farm", () => {
      beforeEach(async () => {
        createFarmDto.user = await usersService.createUser({ email: "user1@test.com", password: "password", address: "address", coordinates })
        await farmsService.createFarm(createFarmDto);
      });

      it("should throw UnprocessableEntityError if farm already exists", async () => {
        await farmsService.createFarm(createFarmDto).catch((error: UnprocessableEntityError) => {
          expect(error).toBeInstanceOf(UnprocessableEntityError);
          expect(error.message).toBe("A farm with the same name already exists");
        });
      });
    });
  });

  describe(".findOneBy", () => {
    const createFarmDto:CreateFarmDto = { name, size, yield:yieldAmount, address, coordinates, user };

    it("should get farm by provided param", async () => {
      createFarmDto.user = await usersService.createUser({ email: "user@test.com", password: "password", address: "address", coordinates })

      const farm = await farmsService.createFarm(createFarmDto);
      const foundFarm = await farmsService.findOneBy({ name: farm?.name });

      expect(foundFarm).toMatchObject({ ...farm });
    });

    it("should return null if farm not found by provided param", async () => {
      const foundFarm = await farmsService.findOneBy({ name: "Not Found" });
      expect(foundFarm).toBeNull();
    });
  });


  describe(".deleteOne", () => {
    const createFarmDto: CreateFarmDto = { name, size, yield:yieldAmount, address, coordinates, user };

    it("should not delete a farm of a different user", async () => {

      const user1 = await usersService.createUser({ email: "user@test.com", password: "password", address: "address", coordinates:{type: "Point", coordinates: [33.803750, -86.669100]} })
      const user2 = await usersService.createUser({ email: "use1r@test.com", password: "password", address: "address", coordinates:{type: "Point", coordinates: [33.803750, -86.669100]} })
      const farm = await farmsService.createFarm({...createFarmDto, user:user1});
      await farmsService.deleteFarm(user2, farm.id).catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect( error.message).toBe("Farm not found");
      });

    });
  });

  describe(".updateOne", () => {
    const createFarmDto: CreateFarmDto = { name, size, yield:yieldAmount, address, coordinates, user };

    it("should not update a farm of a different user", async () => {

      const user1 = await usersService.createUser({ email: "user@test.com", password: "password", address: "address", coordinates:{type: "Point", coordinates: [33.803750, -86.669100]} })
      const user2 = await usersService.createUser({ email: "use1r@test.com", password: "password", address: "address", coordinates:{type: "Point", coordinates: [33.803750, -86.669100]} })
      const farm = await farmsService.createFarm({...createFarmDto, user:user1});
      await farmsService.updateFarm(user2, farm.id, {name:"test new"}).catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(error.message).toBe("Farm not found");
      });

    });
  });

});
