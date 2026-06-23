import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/types/database'

type ProjectFilters = {
  status?: string;
  search?: string;
  departmentId?: string;
  year?: string;
}

export function useProjects(filters?: ProjectFilters) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          department:departments(name),
          project_manager:profiles(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
      
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('stage', filters.status)
      }
      if (filters?.departmentId && filters.departmentId !== 'all') {
        query = query.eq('department_id', filters.departmentId)
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
      // Note: Year filter is omitted for simplicity unless we have a specific year column or parse dates
      
      const { data, error } = await query
      
      if (error) throw error
      return data as Project[]
    }
  })
}

export function useCreateProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newProject: Partial<Project>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single()
        
      if (error) throw error
      return data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export function useProject(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          department:departments(name),
          project_manager:profiles(full_name, avatar_url)
        `)
        .eq('id', id)
        .single()
        
      if (error) throw error
      return data as Project
    },
    enabled: !!id
  })
}
