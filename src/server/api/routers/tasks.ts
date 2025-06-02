import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const taskRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // create: publicProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db.post.create({
  //       data: {
  //         name: input.name,
  //       },
  //     });
  //   }),

  // getAll: publicProcedure.query(async ({ ctx }) => {
  //   const tasks = await ctx.db.task.findMany({
  //     include: {
  //       TaskStatus: true,
  //     }
  //   });
  // }),

});
