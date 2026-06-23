import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import type { UserRole, Position } from '@/lib/permissions';

/** Lấy danh sách toàn bộ người dùng kèm phòng ban */
export function useUsers() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          department:departments(name, code)
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Profile[];
    },
  });
}

/** Lấy profile của người dùng đang đăng nhập (để kiểm tra quyền) */
export function useCurrentProfile() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['current-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*, department:departments(name, code)')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });
}

type UserUpdate = Partial<
  Pick<Profile, 'full_name' | 'phone' | 'department_id' | 'is_active'> & {
    role: UserRole;
    position: Position | null;
  }
>;

/** Cập nhật thông tin / vai trò người dùng */
export function useUpdateUser() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UserUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
