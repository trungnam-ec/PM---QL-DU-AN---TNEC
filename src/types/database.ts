export type Department = {
  id: string;
  code: string;
  name: string;
  created_at: string;
};

export interface Task {
  id: string;
  project_id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  assignee_id?: string;
  due_date?: string;
  position_order: number;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  assignee?: Profile;
}

export interface Contract {
  id: string;
  project_id: string;
  type: 'ab' | 'bc';
  contract_number: string;
  partner_name: string;
  total_value: number;
  signed_date?: string;
  status: 'draft' | 'signed' | 'active' | 'settled' | 'liquidated';
  created_at: string;
  updated_at: string;
  
  // Joined fields
  project?: Project;
}

export interface Transaction {
  id: string;
  project_id?: string;
  contract_id?: string;
  type: 'in' | 'out';
  amount: number;
  transaction_date: string;
  note?: string;
  status: 'pending' | 'completed' | 'cancelled';
  transaction_code?: string | null;
  partner_name?: string | null;
  voucher?: string | null;
  project_name?: string | null;
  source?: string;
  created_at: string;
  updated_at: string;

  // Joined fields
  project?: Project;
  contract?: Contract;
}

// 1 dòng giao dịch sau khi bóc tách từ sao kê, sẵn sàng ghi sổ
export type ParsedBankRow = {
  transaction_code: string | null;
  transaction_date: string;        // ISO yyyy-mm-dd
  type: 'in' | 'out';
  amount: number;
  partner_name: string | null;
  note: string | null;
  voucher: string | null;
  project_name: string | null;
  project_id: string | null;        // map được thì điền
};

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  department_id: string | null;
  role: 'admin' | 'director' | 'manager' | 'staff';
  position: 'director' | 'dept_head' | 'deputy_head' | 'team_lead' | 'specialist' | 'staff' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Joined fields
  department?: { name: string; code: string } | null;
};

export type Project = {
  id: string;
  project_code: string;
  name: string;
  description: string | null;
  owner_unit: string;
  location: string | null;
  province: string | null;
  type: string | null;
  department_id: string | null;
  pm_id: string | null;
  total_value: number | null;
  signed_date: string | null;
  start_date: string | null;
  expected_end_date: string | null;
  stage: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  department?: { name: string } | null;
  project_manager?: { full_name: string; avatar_url: string } | null;
};

export type Contractor = {
  id: string;
  code: string;
  name: string;
  type: 'ntp' | 'ncc';
  tax_code: string | null;
  field: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  rating: number;
  is_active: boolean;
  note: string | null;
  category: string | null;
  transaction_count: number;
  created_at: string;
  updated_at: string;
};

export type BankAccount = {
  id: string;
  acc_code: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  branch: string | null;
  project_group: string | null;
  available_balance: number;
  blocked_balance: number;
  is_active: boolean;
  balance_updated_at: string | null;
  created_at: string;
};

export type EscrowRelease = {
  id: string;
  project_id: string | null;
  project_name: string;
  total_income: number;
  total_expense: number;
  deposit: number;
  fee: number;
  note: string | null;
  period_label: string | null;
  created_at: string;
  updated_at: string;
};

export type CashflowPlan = {
  id: string;
  project_id: string | null;
  project_name: string;
  type: 'thu' | 'chi';
  source: 'available' | 'blocked';
  amount: number;
  week: number | null;
  month: number | null;
  year: number | null;
  note: string | null;
  created_at: string;
};

export type PaymentRequest = {
  id: string;
  code: string;
  project_id: string | null;
  project_name: string | null;
  partner_name: string | null;
  category: string | null;
  content: string | null;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  current_level: number;
  max_level: number;
  requested_by: string | null;
  requester_name: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentApproval = {
  id: string;
  request_id: string;
  level: number;
  approver_id: string | null;
  approver_name: string | null;
  action: 'approve' | 'reject';
  note: string | null;
  created_at: string;
};

export type ProjectBalance = {
  id: string;
  project_id: string | null;
  project_name: string;
  available_opening: number;
  blocked_opening: number;
  period_label: string | null;
  bank_accounts_note: string | null;
  created_at: string;
};

export interface BidPackage {
  id: string;
  project_id: string;
  package_code: string;
  name: string;
  package_type: string;
  estimated_value: number;
  current_stage: number;
  status: string;
  created_at: string;
  updated_at: string;
  
  // Joined
  project?: Project;
}

export interface PackageStageLog {
  id: string;
  bid_package_id: string;
  stage_number: number;
  stage_name: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}
