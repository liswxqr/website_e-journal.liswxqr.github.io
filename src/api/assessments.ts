import type { Assessment } from "@/types";
import { request } from "./client";

export interface AssessmentsFilter {
  studentId?: string;
  groupId?: string;
  subjectId?: string;
  from?: string;
  to?: string;
}

export async function listAssessments(filter: AssessmentsFilter = {}): Promise<Assessment[]> {
  return request<Assessment[]>("/assessments", { query: filter as Record<string, string> });
}

export async function upsertAssessment(
  data: Omit<Assessment, "id"> & { id?: string }
): Promise<Assessment> {
  if (data.id) return request<Assessment>(`/assessments/${data.id}`, { method: "PUT", body: data });
  return request<Assessment>("/assessments", { method: "POST", body: data });
}

export async function deleteAssessment(id: string): Promise<void> {
  return request<void>(`/assessments/${id}`, { method: "DELETE" });
}
