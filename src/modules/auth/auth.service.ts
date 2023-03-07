import * as bcrypt from "bcrypt";
import config from "config/config";
import { fromUnixTime } from "date-fns";
import { UnprocessableEntityError } from "errors/errors";
import { decode, sign, verify } from "jsonwebtoken";
import { UsersService } from "modules/users/users.service";
import { Repository } from "typeorm";
import { LoginUserDto } from "./dto/login-user.dto";
import { AccessToken } from "./entities/access-token.entity";
import dataSource from "orm/orm.config";
import { User } from "../users/entities/user.entity";

export class AuthService {
  private readonly accessTokenRepository: Repository<AccessToken>;
  private readonly usersService: UsersService;

  constructor() {
    this.accessTokenRepository = dataSource.getRepository(AccessToken);
    this.usersService = new UsersService();
  }

  public async login(data: LoginUserDto): Promise<AccessToken> {
    const user = await this.usersService.findOneBy({ email: data.email });

    if (!user) throw new UnprocessableEntityError("Invalid user email or password");

    const isValidPassword = await this.validatePassword(data.password, user.hashedPassword);

    if (!isValidPassword) throw new UnprocessableEntityError("Invalid user email or password");

    const token = sign(
      {
        id: user.id,
        email: user.email,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_AT },
    );
    const tokenExpireDate = this.getJwtTokenExpireDate(token);

    const newToken = this.accessTokenRepository.create({
      token,
      user,
      expiresAt: fromUnixTime(tokenExpireDate),
    });

    return this.accessTokenRepository.save(newToken);
  }

  private getJwtTokenExpireDate(token: string): number {
    const { exp } = decode(token) as { [exp: string]: number };
    return exp;
  }

  private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  public async getUserInfo(token: string): Promise<User> {
    try {
      const decodedToken = verify(token, config.JWT_SECRET) as { [key: string]: any };
      const user = await this.usersService.findOneBy({ id: decodedToken.id });

      if (!user) {
        throw new UnprocessableEntityError("Invalid user id");
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);

      if (decodedToken.exp && decodedToken.exp < nowInSeconds) {
        throw new UnprocessableEntityError("Token expired");
      }

      return user;
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityError("Error with provided token, Please login again");
    }
  }
}
