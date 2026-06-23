"use client";

import React from 'react';
import {
  MODULES,
  PERMISSION_MATRIX,
  ROLE_CONFIG,
  ACCESS_CONFIG,
  type UserRole,
} from '@/lib/permissions';

const ROLE_ORDER: UserRole[] = ['admin', 'director', 'manager', 'staff'];

export function PermissionMatrix() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-slate-800">Ma trận phân quyền</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Quyền mặc định theo vai trò trên từng phân hệ
          </p>
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(ACCESS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: cfg.color }} />
              <span className="text-[11px] text-slate-500">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-[12px] font-semibold text-slate-500 px-5 py-3 w-[200px]">
                Phân hệ
              </th>
              {ROLE_ORDER.map((role) => (
                <th key={role} className="px-3 py-3 text-center">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold"
                    style={{ color: ROLE_CONFIG[role].color, background: ROLE_CONFIG[role].bg }}
                  >
                    {ROLE_CONFIG[role].label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((mod) => (
              <tr key={mod.key} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-5 py-2.5 text-[13px] font-medium text-slate-700">{mod.label}</td>
                {ROLE_ORDER.map((role) => {
                  const access = PERMISSION_MATRIX[role][mod.key];
                  const cfg = ACCESS_CONFIG[access];
                  return (
                    <td key={role} className="px-3 py-2.5 text-center">
                      <span
                        className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold min-w-[72px]"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
