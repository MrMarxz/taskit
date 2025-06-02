// server/api/routers/task.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const taskRouter = createTRPCRouter({
  // Get all task statuses with their tasks
  getAllTaskStatuses: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.taskStatus.findMany({
      include: {
        Task: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }),

  // Get all tasks
  getAllTasks: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.task.findMany({
      include: {
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }),

  // Get tasks by status
  getTasksByStatus: publicProcedure
    .input(z.object({ statusId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findMany({
        where: {
          statusId: input.statusId,
        },
        include: {
          status: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    }),

  // Create a new task
  createTask: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().nullable(),
      statusId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description,
          statusId: input.statusId,
        },
        include: {
          status: true,
        },
      });
    }),

  // Update task status (for drag and drop)
  updateTaskStatus: publicProcedure
    .input(z.object({
      taskId: z.number(),
      statusId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          statusId: input.statusId,
        },
        include: {
          status: true,
        },
      });
    }),

  // Update task details
  updateTask: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().nullable().optional(),
      statusId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.db.task.update({
        where: {
          id,
        },
        data: updateData,
        include: {
          status: true,
        },
      });
    }),

  // Delete a task
  deleteTask: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.delete({
        where: {
          id: input.id,
        },
      });
    }),

  // Create a new task status
  createTaskStatus: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.taskStatus.create({
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),

  // Update task status details
  updateTaskStatusDetails: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.db.taskStatus.update({
        where: {
          id,
        },
        data: updateData,
      });
    }),

  // Delete a task status (only if no tasks are assigned to it)
  deleteTaskStatus: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if there are any tasks with this status
      const tasksCount = await ctx.db.task.count({
        where: {
          statusId: input.id,
        },
      });

      if (tasksCount > 0) {
        throw new Error("Cannot delete task status with existing tasks");
      }

      return ctx.db.taskStatus.delete({
        where: {
          id: input.id,
        },
      });
    }),
});