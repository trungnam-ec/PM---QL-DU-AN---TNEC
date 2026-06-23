import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Department } from '@/types/database'

export function useDepartments() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('code', { ascending: true })
      
      if (error) throw error
      return data as Department[]
    }
  })
}
