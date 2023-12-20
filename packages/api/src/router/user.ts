import { prisma } from "@brain2/db";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  all: publicProcedure.query(() => {
    return prisma.user.findMany({});
  }),
});
