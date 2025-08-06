'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DailyStat {
  adoption_date: string;
  total_adoptions: number;
  approved_adoptions: number;
  rejected_applications: number;
  withdrawn_applications: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.getDailyAdoptionStats();
      setStats(response.stats);
    } catch (err) {
      setError('Failed to load adoption statistics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold mt-4">Adoption Analytics</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Daily Adoption Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading statistics...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Applications</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Rejected</TableHead>
                      <TableHead>Withdrawn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.map((stat) => (
                      <TableRow key={stat.adoption_date}>
                        <TableCell>{new Date(stat.adoption_date).toLocaleDateString()}</TableCell>
                        <TableCell>{stat.total_adoptions}</TableCell>
                        <TableCell>{stat.approved_adoptions}</TableCell>
                        <TableCell>{stat.rejected_applications}</TableCell>
                        <TableCell>{stat.withdrawn_applications}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
