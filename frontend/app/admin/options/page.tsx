"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Globe, School as SchoolIcon, Target, GraduationCap, Plus, Trash2, Pencil, Check, X, Loader2 } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Country {
  id: number;
  name: string;
  code: string | null;
  is_active: boolean;
  sort_order: number;
  schools_count?: number;
}

interface School {
  id: number;
  country_id: number;
  name: string;
  city: string | null;
  type: string | null;
  is_active: boolean;
  sort_order: number;
  country?: { id: number; name: string };
}

interface LearningGoal {
  id: number;
  label: string;
  is_active: boolean;
  sort_order: number;
}

interface GradeNode {
  id: number;
  name: string;
  grade_order: number;
  is_active: boolean;
}

interface LevelNode {
  id: number;
  name: string;
  code: string;
  group_label: string | null;
  level_order: number;
  is_active: boolean;
  grades: GradeNode[];
}

interface CurriculumNode {
  id: number;
  name: string;
  code: string;
  education_levels: LevelNode[];
}

type OptionTab = "countries" | "schools" | "goals" | "curriculum";

const tabs: { key: OptionTab; label: string; icon: React.ElementType }[] = [
  { key: "countries", label: "Countries", icon: Globe },
  { key: "schools", label: "Schools", icon: SchoolIcon },
  { key: "goals", label: "Learning Goals", icon: Target },
  { key: "curriculum", label: "Levels & Grades", icon: GraduationCap },
];

// ─── Reusable bits ────────────────────────────────────────────────────────────

function ActivePill({ active }: { active: boolean }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
      {active ? "Active" : "Hidden"}
    </span>
  );
}

const inputCls =
  "rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOptionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<OptionTab>("countries");
  const [error, setError] = useState("");

  // Data
  const [countries, setCountries] = useState<Country[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [curricula, setCurricula] = useState<CurriculumNode[]>([]);
  const [loading, setLoading] = useState(false);

  // Schools filter
  const [schoolCountryFilter, setSchoolCountryFilter] = useState<number | "">("");

  // Add forms
  const [newCountry, setNewCountry] = useState({ name: "", code: "" });
  const [newSchool, setNewSchool] = useState({ country_id: "", name: "", city: "", type: "" });
  const [newGoal, setNewGoal] = useState("");
  const [newLevel, setNewLevel] = useState({ curriculum_id: "", name: "", group_label: "" });
  const [newGrade, setNewGrade] = useState<{ levelId: number | ""; name: string }>({ levelId: "", name: "" });

  // Inline edit
  const [editing, setEditing] = useState<{ kind: string; id: number } | null>(null);
  const [editValue, setEditValue] = useState<Record<string, string | boolean>>({});

  // Guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }
    if (user && user.role !== "super_admin") {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleError = (err: unknown, fallback: string) => {
    const e = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
    const respErrors = e.response?.data?.errors;
    if (respErrors && typeof respErrors === "object" && !Array.isArray(respErrors)) {
      setError(Object.values(respErrors)[0]?.[0] || fallback);
    } else {
      setError(e.response?.data?.message || fallback);
    }
  };

  // ── Loaders ────────────────────────────────────────────────────────────────
  const loadCountries = useCallback(() => {
    setLoading(true);
    api.get("/admin/countries").then(({ data }) => setCountries(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadSchools = useCallback(() => {
    setLoading(true);
    const q = schoolCountryFilter ? `?country_id=${schoolCountryFilter}` : "";
    api.get(`/admin/schools${q}`).then(({ data }) => setSchools(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [schoolCountryFilter]);

  const loadGoals = useCallback(() => {
    setLoading(true);
    api.get("/admin/learning-goals").then(({ data }) => setGoals(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadCurriculum = useCallback(() => {
    setLoading(true);
    api.get("/admin/curriculum").then(({ data }) => setCurricula(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user || user.role !== "super_admin") return;
    setError("");
    if (activeTab === "countries") loadCountries();
    if (activeTab === "schools") { if (countries.length === 0) loadCountries(); loadSchools(); }
    if (activeTab === "goals") loadGoals();
    if (activeTab === "curriculum") loadCurriculum();
  }, [activeTab, user, loadCountries, loadSchools, loadGoals, loadCurriculum]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mutations ────────────────────────────────────────────────────────────────
  const startEdit = (kind: string, id: number, values: Record<string, string | boolean>) => {
    setEditing({ kind, id });
    setEditValue(values);
    setError("");
  };
  const cancelEdit = () => { setEditing(null); setEditValue({}); };

  // Countries
  const addCountry = async () => {
    if (!newCountry.name.trim()) return;
    try {
      await api.post("/admin/countries", { name: newCountry.name.trim(), code: newCountry.code.trim() || null });
      setNewCountry({ name: "", code: "" });
      loadCountries();
    } catch (e) { handleError(e, "Could not add country."); }
  };
  const saveCountry = async (id: number) => {
    try {
      await api.put(`/admin/countries/${id}`, { name: editValue.name, code: (editValue.code as string)?.trim() || null, is_active: editValue.is_active });
      cancelEdit();
      loadCountries();
    } catch (e) { handleError(e, "Could not update country."); }
  };
  const toggleCountry = async (c: Country) => {
    try { await api.put(`/admin/countries/${c.id}`, { is_active: !c.is_active }); loadCountries(); }
    catch (e) { handleError(e, "Could not update country."); }
  };
  const deleteCountry = async (id: number) => {
    if (!confirm("Delete this country and all its schools?")) return;
    try { await api.delete(`/admin/countries/${id}`); loadCountries(); }
    catch (e) { handleError(e, "Could not delete country."); }
  };

  // Schools
  const addSchool = async () => {
    if (!newSchool.country_id || !newSchool.name.trim()) return;
    try {
      await api.post("/admin/schools", {
        country_id: Number(newSchool.country_id),
        name: newSchool.name.trim(),
        city: newSchool.city.trim() || null,
        type: newSchool.type.trim() || null,
      });
      setNewSchool({ country_id: newSchool.country_id, name: "", city: "", type: "" });
      loadSchools();
    } catch (e) { handleError(e, "Could not add school."); }
  };
  const saveSchool = async (id: number) => {
    try {
      await api.put(`/admin/schools/${id}`, {
        name: editValue.name,
        city: (editValue.city as string)?.trim() || null,
        type: (editValue.type as string)?.trim() || null,
        is_active: editValue.is_active,
      });
      cancelEdit();
      loadSchools();
    } catch (e) { handleError(e, "Could not update school."); }
  };
  const deleteSchool = async (id: number) => {
    if (!confirm("Delete this school?")) return;
    try { await api.delete(`/admin/schools/${id}`); loadSchools(); }
    catch (e) { handleError(e, "Could not delete school."); }
  };

  // Goals
  const addGoal = async () => {
    if (!newGoal.trim()) return;
    try { await api.post("/admin/learning-goals", { label: newGoal.trim() }); setNewGoal(""); loadGoals(); }
    catch (e) { handleError(e, "Could not add goal."); }
  };
  const saveGoal = async (id: number) => {
    try { await api.put(`/admin/learning-goals/${id}`, { label: editValue.label, is_active: editValue.is_active }); cancelEdit(); loadGoals(); }
    catch (e) { handleError(e, "Could not update goal."); }
  };
  const toggleGoal = async (g: LearningGoal) => {
    try { await api.put(`/admin/learning-goals/${g.id}`, { is_active: !g.is_active }); loadGoals(); }
    catch (e) { handleError(e, "Could not update goal."); }
  };
  const deleteGoal = async (id: number) => {
    if (!confirm("Delete this learning goal?")) return;
    try { await api.delete(`/admin/learning-goals/${id}`); loadGoals(); }
    catch (e) { handleError(e, "Could not delete goal."); }
  };

  // Curriculum: levels + grades
  const addLevel = async () => {
    if (!newLevel.curriculum_id || !newLevel.name.trim()) return;
    try {
      await api.post("/admin/curriculum/levels", {
        curriculum_id: Number(newLevel.curriculum_id),
        name: newLevel.name.trim(),
        group_label: newLevel.group_label.trim() || null,
      });
      setNewLevel({ curriculum_id: newLevel.curriculum_id, name: "", group_label: "" });
      loadCurriculum();
    } catch (e) { handleError(e, "Could not add level."); }
  };
  const saveLevel = async (id: number) => {
    try { await api.put(`/admin/curriculum/levels/${id}`, { name: editValue.name, is_active: editValue.is_active }); cancelEdit(); loadCurriculum(); }
    catch (e) { handleError(e, "Could not update level."); }
  };
  const deleteLevel = async (id: number) => {
    if (!confirm("Delete this education level and its grades/subjects?")) return;
    try { await api.delete(`/admin/curriculum/levels/${id}`); loadCurriculum(); }
    catch (e) { handleError(e, "Could not delete level."); }
  };
  const addGrade = async (levelId: number) => {
    if (newGrade.levelId !== levelId || !newGrade.name.trim()) return;
    try {
      await api.post("/admin/curriculum/grades", { education_level_id: levelId, name: newGrade.name.trim() });
      setNewGrade({ levelId: "", name: "" });
      loadCurriculum();
    } catch (e) { handleError(e, "Could not add grade."); }
  };
  const deleteGrade = async (id: number) => {
    if (!confirm("Delete this grade?")) return;
    try { await api.delete(`/admin/curriculum/grades/${id}`); loadCurriculum(); }
    catch (e) { handleError(e, "Could not delete grade."); }
  };

  if (!user || user.role !== "super_admin") return null;

  return (
    <AdminDashboardLayout title="Onboarding Options" activeTab="options">
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Manage Onboarding Options</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Control the countries, schools, learning goals, and curriculum levels students choose from during onboarding.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">{error}</div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        )}

        {/* ── Countries ── */}
        {activeTab === "countries" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border p-4 flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Country name</label>
                <input className={inputCls} value={newCountry.name} placeholder="e.g. France" onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">ISO code (2)</label>
                <input className={`${inputCls} w-24`} value={newCountry.code} placeholder="FR" maxLength={2} onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })} />
              </div>
              <Button onClick={addCountry}><Plus className="w-4 h-4 mr-1" />Add Country</Button>
            </div>

            <div className="bg-white rounded-2xl border border-border divide-y divide-border">
              {countries.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-4">
                  {editing?.kind === "country" && editing.id === c.id ? (
                    <>
                      <input className={`${inputCls} flex-1`} value={(editValue.name as string) ?? ""} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                      <input className={`${inputCls} w-20`} maxLength={2} value={(editValue.code as string) ?? ""} onChange={(e) => setEditValue({ ...editValue, code: e.target.value.toUpperCase() })} />
                      <button onClick={() => saveCountry(c.id)} className="p-2 rounded-lg bg-success/10 text-success"><Check className="w-4 h-4" /></button>
                      <button onClick={cancelEdit} className="p-2 rounded-lg bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        {c.code && <span className="ml-2 text-xs text-muted-foreground">({c.code})</span>}
                        <span className="ml-3 text-xs text-muted-foreground">{c.schools_count ?? 0} schools</span>
                      </div>
                      <button onClick={() => toggleCountry(c)}><ActivePill active={c.is_active} /></button>
                      <button onClick={() => startEdit("country", c.id, { name: c.name, code: c.code ?? "", is_active: c.is_active })} className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteCountry(c.id)} className="p-2 rounded-lg text-error hover:bg-error/10"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              ))}
              {!loading && countries.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No countries yet.</p>}
            </div>
          </div>
        )}

        {/* ── Schools ── */}
        {activeTab === "schools" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border p-4 flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Country</label>
                <select className={inputCls} value={newSchool.country_id} onChange={(e) => setNewSchool({ ...newSchool, country_id: e.target.value })}>
                  <option value="">Select country</option>
                  {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">School name</label>
                <input className={inputCls} value={newSchool.name} placeholder="e.g. Alliance High School" onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">City</label>
                <input className={`${inputCls} w-32`} value={newSchool.city} onChange={(e) => setNewSchool({ ...newSchool, city: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <input className={`${inputCls} w-32`} value={newSchool.type} placeholder="Secondary" onChange={(e) => setNewSchool({ ...newSchool, type: e.target.value })} />
              </div>
              <Button onClick={addSchool}><Plus className="w-4 h-4 mr-1" />Add School</Button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Filter by country:</label>
              <select className={inputCls} value={schoolCountryFilter} onChange={(e) => setSchoolCountryFilter(e.target.value ? Number(e.target.value) : "")}>
                <option value="">All countries</option>
                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-border divide-y divide-border">
              {schools.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-4">
                  {editing?.kind === "school" && editing.id === s.id ? (
                    <>
                      <input className={`${inputCls} flex-1`} value={(editValue.name as string) ?? ""} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                      <input className={`${inputCls} w-28`} placeholder="City" value={(editValue.city as string) ?? ""} onChange={(e) => setEditValue({ ...editValue, city: e.target.value })} />
                      <input className={`${inputCls} w-28`} placeholder="Type" value={(editValue.type as string) ?? ""} onChange={(e) => setEditValue({ ...editValue, type: e.target.value })} />
                      <button onClick={() => saveSchool(s.id)} className="p-2 rounded-lg bg-success/10 text-success"><Check className="w-4 h-4" /></button>
                      <button onClick={cancelEdit} className="p-2 rounded-lg bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground">{s.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {s.country?.name}{s.city ? ` · ${s.city}` : ""}{s.type ? ` · ${s.type}` : ""}
                        </span>
                      </div>
                      <button onClick={() => api.put(`/admin/schools/${s.id}`, { is_active: !s.is_active }).then(loadSchools)}><ActivePill active={s.is_active} /></button>
                      <button onClick={() => startEdit("school", s.id, { name: s.name, city: s.city ?? "", type: s.type ?? "", is_active: s.is_active })} className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteSchool(s.id)} className="p-2 rounded-lg text-error hover:bg-error/10"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              ))}
              {!loading && schools.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No schools found.</p>}
            </div>
          </div>
        )}

        {/* ── Learning Goals ── */}
        {activeTab === "goals" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border p-4 flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-medium text-muted-foreground">Goal label</label>
                <input className={inputCls} value={newGoal} placeholder="e.g. Build a portfolio" onChange={(e) => setNewGoal(e.target.value)} />
              </div>
              <Button onClick={addGoal}><Plus className="w-4 h-4 mr-1" />Add Goal</Button>
            </div>

            <div className="bg-white rounded-2xl border border-border divide-y divide-border">
              {goals.map((g) => (
                <div key={g.id} className="flex items-center gap-3 p-4">
                  {editing?.kind === "goal" && editing.id === g.id ? (
                    <>
                      <input className={`${inputCls} flex-1`} value={(editValue.label as string) ?? ""} onChange={(e) => setEditValue({ ...editValue, label: e.target.value })} />
                      <button onClick={() => saveGoal(g.id)} className="p-2 rounded-lg bg-success/10 text-success"><Check className="w-4 h-4" /></button>
                      <button onClick={cancelEdit} className="p-2 rounded-lg bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-foreground">{g.label}</span>
                      <button onClick={() => toggleGoal(g)}><ActivePill active={g.is_active} /></button>
                      <button onClick={() => startEdit("goal", g.id, { label: g.label, is_active: g.is_active })} className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteGoal(g.id)} className="p-2 rounded-lg text-error hover:bg-error/10"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              ))}
              {!loading && goals.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No learning goals yet.</p>}
            </div>
          </div>
        )}

        {/* ── Curriculum (levels & grades) ── */}
        {activeTab === "curriculum" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border p-4 flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Curriculum</label>
                <select className={inputCls} value={newLevel.curriculum_id} onChange={(e) => setNewLevel({ ...newLevel, curriculum_id: e.target.value })}>
                  <option value="">Select curriculum</option>
                  {curricula.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">New level name</label>
                <input className={inputCls} value={newLevel.name} placeholder="e.g. Diploma" onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Group label</label>
                <input className={`${inputCls} w-40`} value={newLevel.group_label} placeholder="optional" onChange={(e) => setNewLevel({ ...newLevel, group_label: e.target.value })} />
              </div>
              <Button onClick={addLevel}><Plus className="w-4 h-4 mr-1" />Add Level</Button>
            </div>

            <div className="space-y-4">
              {curricula.map((cur) => (
                <div key={cur.id} className="bg-white rounded-2xl border border-border p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">{cur.name}</h3>
                  <div className="space-y-3">
                    {cur.education_levels.map((lvl) => (
                      <div key={lvl.id} className="rounded-xl border border-border p-3">
                        <div className="flex items-center gap-3">
                          {editing?.kind === "level" && editing.id === lvl.id ? (
                            <>
                              <input className={`${inputCls} flex-1`} value={(editValue.name as string) ?? ""} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                              <button onClick={() => saveLevel(lvl.id)} className="p-2 rounded-lg bg-success/10 text-success"><Check className="w-4 h-4" /></button>
                              <button onClick={cancelEdit} className="p-2 rounded-lg bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-sm font-semibold text-foreground">{lvl.name} <span className="text-xs font-normal text-muted-foreground">({lvl.code})</span></span>
                              <button onClick={() => api.put(`/admin/curriculum/levels/${lvl.id}`, { is_active: !lvl.is_active }).then(loadCurriculum)}><ActivePill active={lvl.is_active} /></button>
                              <button onClick={() => startEdit("level", lvl.id, { name: lvl.name, is_active: lvl.is_active })} className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => deleteLevel(lvl.id)} className="p-2 rounded-lg text-error hover:bg-error/10"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>

                        {/* Grades */}
                        <div className="flex flex-wrap gap-2 mt-3 pl-1">
                          {lvl.grades.map((gr) => (
                            <span key={gr.id} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${gr.is_active ? "bg-primary-50 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {gr.name}
                              <button onClick={() => deleteGrade(gr.id)} className="hover:text-error"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                          {newGrade.levelId === lvl.id ? (
                            <span className="inline-flex items-center gap-1">
                              <input autoFocus className={`${inputCls} py-1 w-28`} value={newGrade.name} placeholder="Grade name" onChange={(e) => setNewGrade({ levelId: lvl.id, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addGrade(lvl.id)} />
                              <button onClick={() => addGrade(lvl.id)} className="p-1.5 rounded-lg bg-success/10 text-success"><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setNewGrade({ levelId: "", name: "" })} className="p-1.5 rounded-lg bg-muted text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                            </span>
                          ) : (
                            <button onClick={() => setNewGrade({ levelId: lvl.id, name: "" })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
                              <Plus className="w-3 h-3" /> Add grade
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {cur.education_levels.length === 0 && <p className="text-sm text-muted-foreground">No levels in this curriculum.</p>}
                  </div>
                </div>
              ))}
              {!loading && curricula.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No curricula found.</p>}
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
