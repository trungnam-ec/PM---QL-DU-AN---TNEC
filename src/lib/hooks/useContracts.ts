import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Contract } from '@/types/database';

export function useContracts(type?: 'ab' | 'bc', projectId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['contracts', type, projectId],
    queryFn: async () => {
      let query = supabase
        .from('contracts')
        .select(`
          *,
          project:projects(id, name, project_code)
        `)
        .order('created_at', { ascending: false });

      if (type) query = query.eq('type', type);
      if (projectId) query = query.eq('project_id', projectId);
        
      const { data, error } = await query;
      if (error) throw error;
      return data as Contract[];
    }
  });
}

export function useCreateContract() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newContract: Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'project'>) => {
      const { data, error } = await supabase
        .from('contracts')
        .insert([newContract])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    }
  });
}
