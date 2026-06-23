import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { EscrowRelease, CashflowPlan, ProjectBalance } from '@/types/database';

// ── Phong tỏa / Giải tỏa ──
export function useEscrowReleases() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['escrow-releases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escrow_releases')
        .select('*')
        .order('total_income', { ascending: false });
      if (error) throw error;
      return data as EscrowRelease[];
    },
  });
}

export function useUpsertEscrow() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<EscrowRelease> & { project_name: string }) => {
      const payload = { ...row, updated_at: new Date().toISOString() };
      const { data, error } = row.id
        ? await supabase.from('escrow_releases').update(payload).eq('id', row.id).select().single()
        : await supabase.from('escrow_releases').insert([payload]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['escrow-releases'] }),
  });
}

// ── Kế hoạch dòng tiền (Dự thu / Dự chi) ──
export function useCashflowPlans() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['cashflow-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cashflow_plans')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CashflowPlan[];
    },
  });
}

export function useUpsertCashflowPlan() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<CashflowPlan> & { project_name: string; type: 'thu' | 'chi'; amount: number }) => {
      const { data, error } = row.id
        ? await supabase.from('cashflow_plans').update(row).eq('id', row.id).select().single()
        : await supabase.from('cashflow_plans').insert([row]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cashflow-plans'] });
    },
  });
}

export function useDeleteCashflowPlan() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cashflow_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cashflow-plans'] }),
  });
}

// ── Số dư đầu kỳ theo dự án (Tồn đầu kỳ) ──
export function useProjectBalances() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['project-balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_balances')
        .select('*');
      if (error) throw error;
      return data as ProjectBalance[];
    },
  });
}
