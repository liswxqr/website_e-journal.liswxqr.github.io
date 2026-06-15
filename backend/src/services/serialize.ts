import type { Grade, Assessment, Attendance, ScheduleEntry, User } from "@prisma/client";

// Возвращает безопасный объект юзера без passwordHash
export function publicUser(u: User & { taughtSubjects?: { subjectId: string }[] }) {
  const { passwordHash, taughtSubjects, ...rest } = u as User & { taughtSubjects?: { subjectId: string }[] };
  return {
    ...rest,
    subjectIds: taughtSubjects?.map((t) => t.subjectId) ?? undefined,
  };
}

// Дата в БД — Date, фронту удобнее YYYY-MM-DD
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function publicGrade(g: Grade) {
  return {
    ...g,
    date: isoDate(g.date),
    // -1 в БД → "Н" на клиенте, чтобы не ломать существующий UI
    value: g.value === -1 ? "Н" : g.value,
  };
}

export function publicAssessment(a: Assessment) {
  return {
    ...a,
    date: isoDate(a.date),
  };
}

export function publicAttendance(a: Attendance) {
  return {
    ...a,
    date: isoDate(a.date),
  };
}

export function publicSchedule(s: ScheduleEntry) {
  return s;
}
