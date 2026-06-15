import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { publicAssessment } from "../services/serialize.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const { studentId, groupId, subjectId, from, to } = req.query as Record<string, string | undefined>;
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (groupId) where.groupId = groupId;
    if (subjectId) where.subjectId = subjectId;
    if (from) where.date = { ...(where.date ?? {}), gte: new Date(from) };
    if (to) where.date = { ...(where.date ?? {}), lte: new Date(to + "T23:59:59.999Z") };
    if (req.user!.role === "student") where.studentId = req.user!.userId;

    const items = await prisma.assessment.findMany({ where, orderBy: { date: "desc" } });
    res.json(items.map(publicAssessment));
  } catch (e) {
    next(e);
  }
});

const schema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  subjectId: z.string(),
  groupId: z.string(),
  teacherId: z.string().optional(),
  date: z.string(),
  passed: z.boolean(),
  comment: z.string().optional().nullable(),
});

router.post("/", requireRole("teacher", "admin"), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const created = await prisma.assessment.create({
      data: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        groupId: data.groupId,
        teacherId: data.teacherId ?? req.user!.userId,
        date: new Date(data.date),
        passed: data.passed,
        comment: data.comment ?? null,
      },
    });
    res.status(201).json(publicAssessment(created));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireRole("teacher", "admin"), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const updated = await prisma.assessment.update({
      where: { id: req.params.id },
      data: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        groupId: data.groupId,
        teacherId: data.teacherId ?? req.user!.userId,
        date: new Date(data.date),
        passed: data.passed,
        comment: data.comment ?? null,
      },
    });
    res.json(publicAssessment(updated));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireRole("teacher", "admin"), async (req, res, next) => {
  try {
    await prisma.assessment.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
