INSERT INTO users (name, email, password, role)
VALUES
  ('Admin One', 'Admin1@admin.com', '$2b$10$0louRyxCfC20ssciElogEOf58t1SpK9UVw6tGlvfVSSuSdeVe..re', 'admin'),
  ('Admin Two', 'Admin2@admin.com', '$2b$10$0louRyxCfC20ssciElogEOf58t1SpK9UVw6tGlvfVSSuSdeVe..re', 'admin'),
  ('Admin Three', 'Admin3@admin.com', '$2b$10$0louRyxCfC20ssciElogEOf58t1SpK9UVw6tGlvfVSSuSdeVe..re', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Password hash corresponds to: Admin@123

