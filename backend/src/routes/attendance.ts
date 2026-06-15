import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { publicAttendance } from "../services/serialize.js";

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

    const items = await prisma.attendance.findMany({ where, orderBy: { date: "desc" } });
    res.json(items.map(publicAttendance));
  } catch (e) {
    next(e);
  }
});

const schema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  subjectId: z.string(),
  groupId: z.string(),
  date: z.string(),
  status: z.enum(["present", "absent", "late", "excused"]),
});

// Upsert по (studentId, subjectId, date)
router.post("/", requireRole("teacher", "admin"), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const date = new Date(data.date);
    const item = await prisma.attendance.upsert({
      where: {
        studentId_subjectId_date: {
          studentId: data.studentId,
          subjectId: data.subjectId,
          date,
        },
      },
      update: { status: data.status, groupId: data.groupId },
      create: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        groupId: data.groupId,
        date,
        status: data.status,
      },
    });
    res.status(201).json(publicAttendance(item));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireRole("teacher", "admin"), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const updated = await prisma.attendance.update({
      where: { id: req.params.id },
      data: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        groupId: data.groupId,
        date: new Date(data.date),
        status: data.status,
      },
    });
    res.json(publicAttendance(updated));
  } catch (e) {
    next(e);
  }
});

export default router;
