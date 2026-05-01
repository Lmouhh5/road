import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dataRouter from "./data";
import { requireInternalOrigin } from "../middlewares/requireInternalOrigin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(requireInternalOrigin, dataRouter);

export default router;
