export interface LevelStat {
  count: number;
  total: number;
  matched: number;
  gt_total: number;
  gt_match: number;
  stk_total: number;
  stk_match: number;
  bb_total: number;
  bb_match: number;
  rate: number;
  gt_rate: number;
  stk_rate: number;
  bb_rate: number;
}

export interface DashboardSummary {
  total_ctdt: number;
  total_hp_master: number;
  total_hp_with_data: number;
  total_hp_no_data: number;
  total_courses: number;
  gt_total: number;
  gt_match: number;
  stk_total: number;
  stk_match: number;
  bb_total: number;
  bb_match: number;
  libol_records: number;
  edata_records: number;
  marc_mapped: number;
  hp_0_pct: number;
  hp_below_50: number;
  hp_50_80: number;
  hp_above_80: number;
  avg_hp_rate: number;
  avg_ctdt_rate: number;
  total_all: number;
  match_all: number;
  rate_all: number;
  level_stats: Record<string, LevelStat>;
}

export interface CtdtItem {
  ma: string;
  ten: string;
  level: 'Đại học' | 'Thạc sĩ' | 'Tiến sĩ' | string;
  hp_count: number;
  hp_with_data: number;
  hp_list: string[];
  gt_total: number;
  gt_match: number;
  stk_total: number;
  stk_match: number;
  bb_total: number;
  bb_match: number;
  total: number;
  matched: number;
  rate_overall: number;
  rate_gt: number | null;
  rate_stk: number | null;
  rate_bb: number | null;
  rate_print: number;
  rate_digital: number;
  hp_with_gt_gap: number;
  hp_with_stk_gap: number;
}

export interface HocPhanItem {
  ma: string;
  ten: string;
  has_data: boolean;
  gt_total: number;
  gt_match: number;
  stk_total: number;
  stk_match: number;
  bb_total: number;
  bb_match: number;
  total: number;
  matched: number;
  rate_overall: number | null;
  rate_gt: number | null;
  rate_stk: number | null;
  rate_bb: number | null;
  rate_print: number | null;
  rate_digital: number | null;
  ctdt_list: string[];
  ctdt_count: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  ctdt_data: CtdtItem[];
  hp_data: HocPhanItem[];
}
