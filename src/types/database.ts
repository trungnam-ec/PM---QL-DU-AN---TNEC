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
  created_at: string;
  updated_at: string;
  
  // Joined fields
  project?: Project;
  contract?: Contract;
}

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

export type BankAccount = {
  id: string;
  acc_code: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  branch: string | null;
  project_group: string | null;
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
