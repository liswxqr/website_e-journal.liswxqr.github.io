import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/ui/Loader";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import * as gradesApi from "@/api/grades";
import * as assessmentsApi from "@/api/assessments";
import * as subjectsApi from "@/api/subjects";
import type { Assessment, Grade, Subject } from "@/types";

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      gradesApi.listGrades({ studentId: user.id }),
      assessmentsApi.listAssessments({ studentId: user.id }),
      subjectsApi.listSubjects(),
    ]).then(([g, a, s]) => {
      setGrades(g);
      setAssessments(a);
      setSubjects(s);
      setLoading(false);
    });
  }, [user]);

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const grouped = useMemo(() => {
    const out: Record<string, Grade[]> = {};
    for (const g of grades) {
      if (subjectFilter && g.subjectId !== subjectFilter) continue;
      (out[g.subjectId] ??= []).push(g);
    }
    Object.values(out).forEach((arr) => arr.sort((a, b) => (a.date < b.date ? 1 : -1)));
    return out;
  }, [grades, subjectFilter]);

  if (loading) return <Loader />;

  const overall = avg(grades);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Мои оценки</h1>
          <p>Итоговый средний балл: <strong style={{ color: "var(--primary-700)" }}>{overall.toFixed(2)}</strong></p>
        </div>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <Select
            label="Предмет"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            options={[{ value: "", label: "Все предметы" }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]}
          />
        </div>
      </div>

      {Object.keys(grouped).length === 0 && <div className="empty">Пока нет оценок.</div>}

      <div className="grid-2">
        {Object.entries(grouped).map(([sid, list]) => {
          const subject = subjectMap.get(sid);
          const a = avg(list);
          return (
            <Card
              key={sid}
              title={
                <span>
                  {subject?.name ?? "—"}
                </span>
              }
              action={
                <span className={`grade-pill grade-pill--wide ${pillClass(a)}`}>
                  {a.toFixed(1)}
                </span>
              }
            >
              <div className="grade-list">
                {list.map((g) => (
                  <div className="grade-row" key={g.id}>
                    <div>
                      <div className="grade-row__subject">{formatDate(g.date)}</div>
                      <div className="grade-row__meta">{g.comment ?? "—"}</div>
                    </div>
                    <Pill value={g.value} />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {assessments.length > 0 && (
        <div className="mt-24">
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Зачёты</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Предмет</th>
                  <th>Дата</th>
                  <th>Результат</th>
                </tr>
              </thead>
              <tbody>
                {assessments
                  .slice()
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((a) => (
                    <tr key={a.id}>
                      <td><strong>{subjectMap.get(a.subjectId)?.name ?? "—"}</strong></td>
                      <td className="muted">{formatDate(a.date)}</td>
                      <td>
                        <Badge variant={a.passed ? "success" : "danger"}>
                          {a.passed ? "Зачёт" : "Незачёт"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function avg(list: Grade[]): number {
  const nums: number[] = [];
  for (const g of list) if (typeof g.value === "number") nums.push(g.value);
  if (!nums.length) return 0;
  return nums.reduce((s, v) => s + v, 0) / nums.length;
}
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function pillClass(v: number): string {
  if (v >= 8) return "g-high";
  if (v >= 6) return "g-good";
  if (v >= 4) return "g-mid";
  return "g-low";
}

function Pill({ value }: { value: Grade["value"] }) {
  if (value === "Н" || value === "") return <div className="grade-pill g-low">Н</div>;
  if (typeof value !== "number") return <div className="grade-pill g-low">—</div>;
  return <div className={`grade-pill ${pillClass(value)}`}>{value}</div>;
}
