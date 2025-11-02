import { protectedProcedure, publicProcedure, router } from "../index";
import { stellarRouter } from "./stellar";
import { agentRouter } from "./agent";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	stellar: stellarRouter,
	agent: agentRouter,
});
export type AppRouter = typeof appRouter;
