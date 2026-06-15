import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res, next) => {
  try {
    const groups = await prisma.group.findMany({
      include: { students: { select: { id: true } } },
      orderBy: { name: "asc" },
    });
    res.json(
      groups.map((g) => ({
        id: g.id,
        name: g.name,
        year: g.year,
        homeroomTeacherId: g.homeroomTeacherId,
        studentIds: g.students.map((s) => s.id),
      }))
    );
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const g = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: { students: { select: { id: true } } },
    });
    if (!g) return res.status(404).json({ message: "Не найдено" });
    res.json({
      id: g.id,
      name: g.name,
      year: g.year,
      homeroomTeacherId: g.homeroomTeacherId,
      studentIds: g.students.map((s) => s.id),
    });
  } catch (e) {
    next(e);
  }
});

const schema = z.object({
  name: z.string().min(1),
  year: z.number().int(),
  homeroomTeacherId: z.string().optional().nullable(),
  studentIds: z.array(z.string()).default([]),
});

router.post("/", requireRole("admin"), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const created = await prisma.group.create({
      data: {
        name: data.name,
        year: data.year,
        homeroomTeacherId: data.homeroomTeacherId ?? null,
      },
    });
    if (data.studentIds.length) {
      await prisma.user.updateMany({
        where: { id: { in: data.studentIds } },
        data: { groupId: created.id },
      });
    }
    res.status(201).json({
      id: created.id,
      name: created.name,
      year: created.year,
      homeroomTeacherId: created.homeroomTeacherId,
      studentIds: data.studentIds,
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    const data = schema.partial().parse(req.body);
    const updated = await prisma.group.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        year: data.year,
        homeroomTeacherId: data.homeroomTeacherId ?? undefined,
      },
    });
    if (data.studentIds) {
      // Сбрасываем всех нынешних участников
      await prisma.user.updateMany({
        where: { groupId: updated.id },
        data: { groupId: null },
      });
      if (data.studentIds.length) {
        await prisma.user.updateMany({
          where: { id: { in: data.studentIds } },
          data: { groupId: updated.id },
        });
      }
    }
    const full = await prisma.group.findUnique({
      where: { id: updated.id },
      include: { students: { select: { id: true } } },
    });
    res.json({
      id: full!.id,
      name: full!.name,
      year: full!.year,
      homeroomTeacherId: full!.homeroomTeacherId,
      studentIds: full!.students.map((s) => s.id),
    });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    await prisma.group.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
