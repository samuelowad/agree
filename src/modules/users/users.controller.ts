import { NextFunction, Request, Response } from "express";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { GoogleMapHelper } from "helpers/google-map.helper";

export class UsersController {
  private readonly usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userDto = req.body as CreateUserDto

      userDto.coordinates = await GoogleMapHelper.getCoordinatesFromAddress(userDto.address)
      const user = await this.usersService.createUser(userDto);

      res.status(201).send(user);
    } catch (error) {
      next(error);
    }
  }
}
