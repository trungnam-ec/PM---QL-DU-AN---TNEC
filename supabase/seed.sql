-- Departments
INSERT INTO public.departments (code, name) VALUES
('BGD',  'Ban Giám đốc'),
('KHDT', 'Kế hoạch Đấu thầu'),
('QLDA', 'Quản lý Dự án'),
('TCKT', 'Tài chính Kế toán'),
('HCNS', 'Hành chính Nhân sự')
ON CONFLICT (code) DO NOTHING;

-- Bank accounts (từ DM Chuẩn hóa)
INSERT INTO public.bank_accounts (acc_code, account_number, account_name, bank_name, branch, project_group) VALUES
('TK011', '0190 5801 011', 'TNEC A GIÁP NHẬN',             'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK022', '0190 5801 022', 'TK Tây Ninh EC NEW',            'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK024', '0190 5801 024', 'Tạm ứng đợt 2 An Giang',        'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK025', '0190 5801 025', 'TK các dự án nội bộ TNG',       'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK026', '0190 5801 026', 'TK chung EC NEW',               'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK027', '0190 5801 027', 'TK Tỉnh lộ 8',                  'TP BANK', 'CN Cửu Long', 'EC NEW'),
('TK004', '0190 5801 004', 'DA khu tái định cư Hòa Bắc gỡ 2','TP BANK','CN Đà Nẵng', 'Đà Nẵng'),
('TK000', '0190 5801 000', 'TK Trung Nam EC chung',         'TP BANK', 'CN Đà Nẵng', 'Đà Nẵng'),
('TK005', '0190 5801 005', 'DA tuyến đường vành đai phía Tây','TP BANK','CN Đà Nẵng','Đà Nẵng'),
('TK016', '0190 5801 016', 'TK EC chung Đà Nẵng',           'TP BANK', 'CN Đà Nẵng', 'Đà Nẵng'),
('TK001', '0190 5801 001', 'Cao tốc KHBM',                  'TP BANK', 'CN Cửu Long', 'Cao tốc'),
('TK007', '0190 5801 007', 'Cao tốc Hậu Giang',             'TP BANK', 'CN Cửu Long', 'Cao tốc'),
('TK008', '0190 5801 008', 'Cao tốc Sóc Trăng',             'TP BANK', 'CN Cửu Long', 'Cao tốc'),
('TK018', '0190 5801 018', 'TK Cao tốc',                    'TP BANK', 'CN Cửu Long', 'Cao tốc'),
('TK019', '0190 5801 019', 'TK Cao tốc (2)',                 'TP BANK', 'CN Cửu Long', 'Cao tốc')
ON CONFLICT (acc_code) DO NOTHING;
