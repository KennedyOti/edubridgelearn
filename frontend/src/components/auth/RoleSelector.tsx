"use client";

import { PublicRole  } from "@/types/auth.types";

interface Props {
  value: PublicRole | "";
  onChange: (role: PublicRole) => void;
}

const roles = [
  {
    value: "student",
    title: "Student",
    description: "I'm here to learn and conquer knowledge 🧠",
  },
  {
    value: "tutor",
    title: "Tutor",
    description: "I shape minds and drop wisdom daily 🎓",
  },
  {
    value: "contributor",
    title: "Contributor",
    description: "I bring value to the learning ecosystem 🌍",
  },
];

export default function RoleSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-4">
      <p className="text-sm font-semibold text-muted">
        Choose your learning alter ego:
      </p>

      <div className="grid gap-3">
        {roles.map((role) => (
          <button
            type="button"
            key={role.value}
            onClick={() => onChange(role.value as PublicRole)}
            className={`card card-hover text-left ${
              value === role.value
                ? "border-brand-500 ring-2 ring-brand/30"
                : ""
            }`}
          >
            <h3 className="text-lg font-semibold text-brand">
              {role.title}
            </h3>
            <p className="text-sm text-muted">{role.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
