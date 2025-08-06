"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Eye, Check, X, FileText, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Application {
  id: number;
  status: string;
  reason: string;
  experience?: string;
  livingSituation?: string;
  otherPets?: string;
  createdAt: string;
  pet: { id: number; name: string };
  adopter: { id: number; firstName: string; lastName: string; email: string };
}

export default function StaffApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await api.getApplications({ limit: 50 });
      const transformedApplications = data.applications.map((app: any) => ({
        ...app.applications,
        pet: app.pets,
        adopter: app.users,
      }));
      setApplications(transformedApplications || []);
      setError(null);
    } catch (err) {
      console.error("Fetch applications error:", err);
      setError("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.approveApplication(id);
      fetchApplications();
    } catch (err) {
      console.error('Approve application error:', err);
      setError('Failed to approve application.');
    }
  };

  return (
    <ProtectedRoute requiredRole="STAFF">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Review Applications
            </h1>
            <p className="text-gray-600">Review and process adoption applications</p>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">{error}</div>}
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <Card key={app.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Application #{app.id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <span className="font-semibold">Pet:</span> {app.pet.name}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Adopter:</span> {app.adopter.firstName} {app.adopter.lastName} ({app.adopter.email})
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Status:</span> {app.status}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Reason:</span> {app.reason}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/staff/applications/${app.id}`)}>
                        <Eye className="h-4 w-4 mr-1" /> Review
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/staff/applications/${app.id}?tab=comments`)}>
                        <MessageCircle className="h-4 w-4 mr-1" /> Comments
                      </Button>
                      {/* {app.status === 'PENDING' && (
                        <Button size="sm" onClick={() => handleApprove(app.id)}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      )} */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
