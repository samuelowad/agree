import { NextFunction, Request, Response } from "express";
import { AuthService } from "modules/auth/auth.service";
import { UnprocessableEntityError } from "errors/errors";

export async function authorize(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) throw new UnprocessableEntityError("Unauthorized request");

        const authService = new AuthService();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        req.body.user = await authService.getUserInfo(token);

        next();
    } catch (error) {
        next(error);
    }
}
