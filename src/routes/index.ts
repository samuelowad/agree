import { Router } from "express";
import auth from "./auth.routes";
import user from "./user.routes";
import farm from "./farm.routes";
import { authorize } from "middlewares/auth.middleware";

const router = Router({ mergeParams: true });

router.use("/auth", auth);
router.use("/users", user);
router.use("/farm", authorize, farm);

const routes = Router();
routes.use("/v1", router);


export default routes;
