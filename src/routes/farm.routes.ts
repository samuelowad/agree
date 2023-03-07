import { RequestHandler, Router } from "express";
import { FarmsController } from "modules/farms/farms.controller";

const router = Router();
const farmsController = new FarmsController();

router.post("/",  farmsController.create.bind(farmsController) as RequestHandler);
router.get("/",  farmsController.getAll.bind(farmsController) as RequestHandler);
router.post("/delete",  farmsController.delete.bind(farmsController) as RequestHandler);
router.post("/update",  farmsController.update.bind(farmsController) as RequestHandler);

export default router;
