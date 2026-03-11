
export interface Student {
  id: string;
  name: string;
  city: string;
  originalData: Record<string, string>;
  createdAt?: string;
}

export interface FetchResult {
  students: Student[];
  error?: string;
}

export interface InsightStats {
  totalCount: number;
  locationDistribution: Record<string, number>;
  latestRegistrations: Student[];
}
