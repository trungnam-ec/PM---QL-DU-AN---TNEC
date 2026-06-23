import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ParsedBankRow } from '@/types/database';

/**
 * Ghi nhiều giao dịch từ sao kê vào sổ.
 * Chống trùng theo transaction_code (unique index 009) — dòng trùng tự bỏ qua.
 */
export function useImportBankTransactions() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (rows: ParsedBankRow[]) => {
      const payload = rows.map((r) => ({
        transaction_code: r.transaction_code,
        transaction_date: r.transaction_date,
        type: r.type,
        amount: r.amount,
        partner_name: r.partner_name,
        note: r.note,
        voucher: r.voucher,
        project_name: r.project_name,
        project_id: r.project_id,
        status: 'completed',
        source: 'bank_import',
      }));

      // upsert + ignoreDuplicates: dòng có transaction_code đã tồn tại sẽ bị bỏ qua
      const { data, error } = await supabase
        .from('transactions')
        .upsert(payload, { onConflict: 'transaction_code', ignoreDuplicates: true })
        .select();

      if (error) throw error;
      return { inserted: data?.length ?? 0, total: rows.length };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
