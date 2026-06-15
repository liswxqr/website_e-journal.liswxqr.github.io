import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const { groupId, teacherId } = req.query as Record<string, string | undefined>;
    const where: any = {};
    if (groupId) where.groupId = groupId;
    if (teacherId) where.teacherId = teacherId;

    // Если студент — только своя группа
    if (req.user!.role === "student") {
      const me = await prisma.user.findUnique({ where: { id: req.user!.userId } });
      if (me?.groupId) where.groupId = me.groupId;
    }

    const items = await prisma.scheduleEntry.findMany({
      where,
      orderBy: [{ dayOfWeek: "asc" }, { lessonNumber: "asc" }],
    });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

const schema = z.object({
  id: z.string().optional(),
  groupId: z.string(),
  subjectId: z.string(),
  teacherId: z.string(),
  dayOfWeek: z.number().int().min(1).max(6),
  lessonNumber: z.number().int().min(1).max(8),
  room: z.string().optional().nullable(),
});

router.post("/", requireRole("admin"), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const created = await prisma.scheduleEntry.create({ data: { ...data, room: data.room ?? null } });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const updated = await prisma.scheduleEntry.update({
      where: { id: req.params.id },
      data: { ...data, room: data.room ?? null },
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    await prisma.scheduleEntry.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
