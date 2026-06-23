import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Transaction } from '@/types/database';

export function useTransactions(projectId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['transactions', projectId],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          project:projects(name),
          contract:contracts(contract_number)
        `)
        .order('transaction_date', { ascending: false });

      if (projectId) query = query.eq('project_id', projectId);
        
      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    }
  });
}

export function useCreateTransaction() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTx: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'project' | 'contract'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTx])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
}
