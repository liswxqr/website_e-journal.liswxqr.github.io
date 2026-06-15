import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { publicGrade } from "../services/serialize.js";

const router = Router();
router.use(requireAuth);

// Студент видит только свои; препод — где он teacherId или его группы; админ — всё
router.get("/", async (req, res, next) => {
  try {
    const { studentId, groupId, subjectId, from, to } = req.query as Record<string, string | undefined>;
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (groupId) where.groupId = groupId;
    if (subjectId) where.subjectId = subjectId;
    if (from) where.date = { ...(where.date ?? {}), gte: new Date(from) };
    if (to) where.date = { ...(where.date ?? {}), lte: new Date(to + "T23:59:59.999Z") };

    // Ограничения по роли
    if (req.user!.role === "student") {
      where.studentId = req.user!.userId;
    }
    // Препод видит все оценки по своим предметам (без жёсткой проверки teacherId)

    const grades = await prisma.grade.findMany({ where, orderBy: { date: "desc" } });
    res.json(grades.map(publicGrade));
  } catch (e) {
    next(e);
  }
});

const upsertSchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  subjectId: z.string(),
  groupId: z.string(),
  teacherId: z.string().optional(), // подставим из токена
  date: z.string(), // YYYY-MM-DD
  value: z.union([z.number().int().min(1).max(10), z.literal("Н"), z.literal(-1)]),
  comment: z.string().optional().nullable(),
});

router.post("/", requireRole("teacher", "admin"), async (req, res, next) => {
  try {
    const data = upsertSchema.parse(req.body);
    const numericValue = data.value === "Н" ? -1 : Number(data.value);
    const created = await prisma.grade.create({
      data: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        groupId: data.groupId,
        teacherId: data.teacherId ?? req.user!.userId,
        date: new Date(data.date),
        value: numericValue,
        comment: data.comment ?? null,
      },
    });
    res.status(201).json(publicGrade(created));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireRole("teacher", "admin"), async (req, res, next) => {
  try {
    const data = upsertSchema.parse(req.body);
    const numericValue = data.value === "Н" ? -1 : Number(data.value);
    const updated = await prisma.grade.update({
      where: { id: req.params.id },
      data: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        groupId: data.groupId,
        teacherId: data.teacherId ?? req.user!.userId,
        date: new Date(data.date),
        value: numericValue,
        comment: data.comment ?? null,
      },
    });
    res.json(publicGrade(updated));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireRole("teacher", "admin"), async (req, res, next) => {
  try {
    await prisma.grade.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
