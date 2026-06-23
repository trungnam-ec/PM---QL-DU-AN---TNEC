import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { BidPackage } from '@/types/database'

export function useAllBidPackages() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['all-bid-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bid_packages')
        .select(`
          *,
          project:projects(name, project_code)
        `)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      return data as BidPackage[]
    }
  })
}

export function useUpdateBidPackageStage() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, stage }: { id: string, stage: number }) => {
      const { data, error } = await supabase
        .from('bid_packages')
        .update({ current_stage: stage, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
        
      if (error) throw error
      return data as BidPackage
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bid-packages'] })
      queryClient.invalidateQueries({ queryKey: ['bid-packages'] })
    }
  })
}
