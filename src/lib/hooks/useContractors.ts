import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Contractor } from '@/types/database';

export function useContractors(type?: 'ntp' | 'ncc') {
  const supabase = createClient();

  return useQuery({
    queryKey: ['contractors', type],
    queryFn: async () => {
      let query = supabase
        .from('contractors')
        .select('*')
        .order('name', { ascending: true });
      if (type) query = query.eq('type', type);

      const { data, error } = await query;
      if (error) throw error;
      return data as Contractor[];
    },
  });
}

export function useCreateContractor() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (c: Omit<Contractor, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('contractors').insert([c]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contractors'] }),
  });
}
