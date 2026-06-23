import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PaymentRequest, PaymentApproval } from '@/types/database';
import { requiredLevels } from '@/lib/paymentWorkflow';

export function usePaymentRequests() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['payment-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PaymentRequest[];
    },
  });
}

export function usePaymentApprovals(requestId?: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['payment-approvals', requestId],
    enabled: !!requestId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_approvals')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as PaymentApproval[];
    },
  });
}

type NewRequest = {
  project_id: string | null;
  project_name: string | null;
  partner_name: string | null;
  category: string | null;
  content: string | null;
  amount: number;
  requested_by: string | null;
  requester_name: string | null;
};

export function useCreatePaymentRequest() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: NewRequest) => {
      const code = 'DNC-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' +
        Math.floor(Math.random() * 9000 + 1000);
      const { data, error } = await supabase
        .from('payment_requests')
        .insert([{
          ...r, code,
          status: 'pending', current_level: 1, max_level: requiredLevels(r.amount),
        }])
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-requests'] }),
  });
}

type ApprovalInput = {
  request: PaymentRequest;
  action: 'approve' | 'reject';
  note?: string;
  approver_id: string | null;
  approver_name: string | null;
};

export function useDecidePaymentRequest() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ request, action, note, approver_id, approver_name }: ApprovalInput) => {
      // 1. Ghi nhật ký duyệt cấp hiện tại
      const { error: aErr } = await supabase.from('payment_approvals').insert([{
        request_id: request.id, level: request.current_level,
        approver_id, approver_name, action, note: note || null,
      }]);
      if (aErr) throw aErr;

      // 2. Cập nhật trạng thái đề nghị
      let patch: Partial<PaymentRequest>;
      if (action === 'reject') {
        patch = { status: 'rejected' };
      } else if (request.current_level >= request.max_level) {
        patch = { status: 'approved' };       // duyệt xong cấp cuối
      } else {
        patch = { current_level: request.current_level + 1 };  // lên cấp tiếp
      }
      const { error: uErr } = await supabase
        .from('payment_requests')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', request.id);
      if (uErr) throw uErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-requests'] });
      qc.invalidateQueries({ queryKey: ['payment-approvals'] });
    },
  });
}
