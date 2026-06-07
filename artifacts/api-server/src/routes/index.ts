import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminCustomersRouter from "./admin/customers";
import adminServicesRouter from "./admin/services";
import adminPointsRouter from "./admin/points";
import adminReferralsRouter from "./admin/referrals";
import adminCommissionsRouter from "./admin/commissions";
import adminDashboardRouter from "./admin/dashboard";
import meRouter from "./me";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminCustomersRouter);
router.use(adminServicesRouter);
router.use(adminPointsRouter);
router.use(adminReferralsRouter);
router.use(adminCommissionsRouter);
router.use(adminDashboardRouter);
router.use(meRouter);

export default router;
