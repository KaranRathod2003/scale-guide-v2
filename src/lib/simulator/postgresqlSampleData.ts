export interface SampleTable {
  name: string;
  columns: string[];
  rows: Record<string, string | number>[];
}

export const sampleTables: SampleTable[] = [
  {
    name: 'employees',
    columns: ['id', 'name', 'department', 'salary', 'hire_date'],
    rows: [
      { id: 1, name: 'Alice', department: 'Engineering', salary: 95000, hire_date: '2020-01-15' },
      { id: 2, name: 'Bob', department: 'Marketing', salary: 72000, hire_date: '2019-06-01' },
      { id: 3, name: 'Carol', department: 'Engineering', salary: 105000, hire_date: '2018-03-20' },
      { id: 4, name: 'Dave', department: 'Sales', salary: 68000, hire_date: '2021-09-10' },
      { id: 5, name: 'Eve', department: 'Engineering', salary: 115000, hire_date: '2017-11-30' },
    ],
  },
  {
    name: 'departments',
    columns: ['id', 'name', 'budget', 'location'],
    rows: [
      { id: 1, name: 'Engineering', budget: 2000000, location: 'Building A' },
      { id: 2, name: 'Marketing', budget: 800000, location: 'Building B' },
      { id: 3, name: 'Sales', budget: 600000, location: 'Building C' },
    ],
  },
  {
    name: 'projects',
    columns: ['id', 'name', 'lead_id', 'start_date', 'status'],
    rows: [
      { id: 1, name: 'Platform Rewrite', lead_id: 5, start_date: '2023-01-10', status: 'active' },
      { id: 2, name: 'Mobile App v2', lead_id: 1, start_date: '2023-06-01', status: 'active' },
      { id: 3, name: 'Data Pipeline', lead_id: 3, start_date: '2022-11-15', status: 'completed' },
    ],
  },
];

// Pre-computed query results keyed by exercise ID
export const queryResults: Record<string, Record<string, string | number>[]> = {
  'select-basics': [
    { id: 5, name: 'Eve', department: 'Engineering', salary: 115000, hire_date: '2017-11-30' },
    { id: 3, name: 'Carol', department: 'Engineering', salary: 105000, hire_date: '2018-03-20' },
    { id: 2, name: 'Bob', department: 'Marketing', salary: 72000, hire_date: '2019-06-01' },
    { id: 1, name: 'Alice', department: 'Engineering', salary: 95000, hire_date: '2020-01-15' },
    { id: 4, name: 'Dave', department: 'Sales', salary: 68000, hire_date: '2021-09-10' },
  ],
  'where-filter': [
    { id: 3, name: 'Carol', department: 'Engineering', salary: 105000, hire_date: '2018-03-20' },
    { id: 5, name: 'Eve', department: 'Engineering', salary: 115000, hire_date: '2017-11-30' },
  ],
  'aggregate-group': [
    { department: 'Engineering', emp_count: 3, avg_salary: 105000 },
    { department: 'Marketing', emp_count: 1, avg_salary: 72000 },
    { department: 'Sales', emp_count: 1, avg_salary: 68000 },
  ],
  'join-basics': [
    { name: 'Alice', salary: 95000, location: 'Building A', budget: 2000000 },
    { name: 'Bob', salary: 72000, location: 'Building B', budget: 800000 },
    { name: 'Carol', salary: 105000, location: 'Building A', budget: 2000000 },
    { name: 'Dave', salary: 68000, location: 'Building C', budget: 600000 },
    { name: 'Eve', salary: 115000, location: 'Building A', budget: 2000000 },
  ],
  'subquery-window': [
    { name: 'Eve', department: 'Engineering', salary: 115000, dept_rank: 1 },
    { name: 'Carol', department: 'Engineering', salary: 105000, dept_rank: 2 },
    { name: 'Alice', department: 'Engineering', salary: 95000, dept_rank: 3 },
    { name: 'Bob', department: 'Marketing', salary: 72000, dept_rank: 1 },
    { name: 'Dave', department: 'Sales', salary: 68000, dept_rank: 1 },
  ],
  'cte-recursive': [
    { project: 'Platform Rewrite', lead: 'Eve', salary: 115000 },
    { project: 'Mobile App v2', lead: 'Alice', salary: 95000 },
  ],
  'distinct-values': [
    { department: 'Engineering' },
    { department: 'Marketing' },
    { department: 'Sales' },
  ],
  'having-clause': [
    { department: 'Engineering', emp_count: 3 },
  ],
  'case-expression': [
    { name: 'Eve', salary: 115000, level: 'Senior' },
    { name: 'Carol', salary: 105000, level: 'Senior' },
    { name: 'Alice', salary: 95000, level: 'Mid' },
    { name: 'Bob', salary: 72000, level: 'Mid' },
    { name: 'Dave', salary: 68000, level: 'Junior' },
  ],
  'string-functions': [
    { upper_name: 'ALICE', lower_dept: 'engineering', name_length: 5 },
    { upper_name: 'BOB', lower_dept: 'marketing', name_length: 3 },
    { upper_name: 'CAROL', lower_dept: 'engineering', name_length: 5 },
    { upper_name: 'DAVE', lower_dept: 'sales', name_length: 4 },
    { upper_name: 'EVE', lower_dept: 'engineering', name_length: 3 },
  ],
  'date-functions': [
    { name: 'Eve', hire_date: '2017-11-30', years_employed: 6.1 },
    { name: 'Carol', hire_date: '2018-03-20', years_employed: 5.8 },
    { name: 'Bob', hire_date: '2019-06-01', years_employed: 4.6 },
    { name: 'Alice', hire_date: '2020-01-15', years_employed: 3.9 },
    { name: 'Dave', hire_date: '2021-09-10', years_employed: 2.3 },
  ],
  'self-join': [
    { employee_1: 'Alice', employee_2: 'Carol', department: 'Engineering' },
    { employee_1: 'Alice', employee_2: 'Eve', department: 'Engineering' },
    { employee_1: 'Carol', employee_2: 'Eve', department: 'Engineering' },
  ],
};
