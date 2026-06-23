import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { BankAccount } from '@/types/database';

export function useBankAccounts() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('acc_code', { ascending: true });

      if (error) throw error;
      return data as BankAccount[];
    },
  });
}

export function useCreateBankAccount() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAcc: Omit<BankAccount, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([newAcc])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });
}
