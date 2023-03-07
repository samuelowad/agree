import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { Point } from "geojson";
import {CreateUserDto} from "../../users/dto/create-user.dto";
import { UsersService } from "../../users/users.service";
import { LoginUserDto } from "../../auth/dto/login-user.dto";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { User } from "../../users/entities/user.entity";

describe("FarmsController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

  let usersService: UsersService;

  const coordinates :Point = {type: "Point", coordinates: [0, 0]};
  const address = "138 Narrows Rd, Remlap, Alabama 35133, USA";
  let user:User;

  beforeAll(() => {
    app = setupServer();
    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    await ds.initialize();
    agent = supertest.agent(app);

    usersService = new UsersService();
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe("POST /farms", () => {

    const loginDto: LoginUserDto = { email: "user@test1.com", password: "password"  };
    const createUserDto: CreateUserDto = { ...loginDto, address, coordinates };
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);
    const  createFarmDto = { name: "farm", address, coordinates, user, size:100, yield:10 } as CreateFarmDto;
    it("should create new farm", async () => {

      await createUser({...loginDto,  coordinates: {type: "Point", coordinates: [0, 0]}, address });

      const loginRes = await agent.post("/api/v1/auth/login").send(loginDto);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
       const { token }  = loginRes.body;
      const res = await agent.post("/api/v1/farm").send(createFarmDto).set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        address: expect.stringContaining(createUserDto.address) as string,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

  });

  describe("POST /delete", () => {

    const loginDto: LoginUserDto = { email: "user@test1.com", password: "password" };
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);
    const createFarmDto = { name: "farm117", address, coordinates, user, size: 100, yield: 10 } as CreateFarmDto;

    it("should not be able to delete another user farm", async () => {
      const user1 = await createUser({ coordinates: { type: "Point", coordinates: [0, 0] }, address, email: "user1@tes.com", password: "password" });
       await createUser({ ...loginDto, coordinates: { type: "Point", coordinates: [0, 0] }, address });

      const user1loginRes = await agent.post("/api/v1/auth/login").send({ ...loginDto, email: user1.email });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { token } = user1loginRes.body;
      const farm = await agent.post("/api/v1/farm").send(createFarmDto).set("Authorization", `Bearer ${token}`);

      const user2loginRes = await agent.post("/api/v1/auth/login").send({ ...loginDto});
      const res = await agent
          .post("/api/v1/farm/delete")
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          .send({ id: farm.body.id })
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .set("Authorization", `Bearer ${user2loginRes.body.token}`);

      expect(res.statusCode).toBe(500);

    });

  });


  describe("POST /update", () => {

    const loginDto: LoginUserDto = { email: "user@test1.com", password: "password" };
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);
    const createFarmDto = { name: "farm117", address, coordinates, user, size: 100, yield: 10 } as CreateFarmDto;

    it("should not be able to update another user farm", async () => {
      const user1 = await createUser({ coordinates: { type: "Point", coordinates: [0, 0] }, address, email: "user1@tes.com", password: "password" });
      await createUser({ ...loginDto, coordinates: { type: "Point", coordinates: [0, 0] }, address });

      const user1loginRes = await agent.post("/api/v1/auth/login").send({ ...loginDto, email: user1.email });
      const { token } = user1loginRes.body;
      const farm = await agent.post("/api/v1/farm").send(createFarmDto).set("Authorization", `Bearer ${token}`);

      const user2loginRes = await agent.post("/api/v1/auth/login").send({ ...loginDto});
      const res = await agent
          .post("/api/v1/farm/update")
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          .send({ id: farm.body.id, name: "new name" })
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .set("Authorization", `Bearer ${user2loginRes.body.token}`);

      expect(res.statusCode).toBe(500);

    });

  });

});
