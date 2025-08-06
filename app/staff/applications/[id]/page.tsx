"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Eye, Check, X, FileText, MessageCircle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

interface Application {
  id: number;
  status: string;
  reason: string;
  experience?: string;
  livingSituation?: string;
  otherPets?: string;
  createdAt: string;
  updatedAt: string;
  pet: { id: number; name: string; status: string; species: { id: number; name: string }; breed: { id: number; name: string } };
  adopter: { id: number; firstName: string; lastName: string; email: string };
}

interface Note {
    id: number;
    content: string;
    isInternal: boolean;
    createdAt: string;
    author: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

export default function StaffApplicationReviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const tab = searchParams.get('tab') || 'details';

  const [application, setApplication] = useState<Application | null>(null);
  const [pet, setPet] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appData, notesData] = await Promise.all([
        api.getApplication(Number(id)),
        api.getApplicationNotes(Number(id))
      ]);

      setApplication(appData.application);
      setPet(appData.application.pet);
      setNotes(notesData.notes || []);

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      setApplication(data.application);
      setPet(data.application.pet);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await fetch(`${API_BASE_URL}/applications/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newNote, isInternal: true }),
      });
      setNewNote("");
      fetchData(); // Refresh notes
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!application) {
    return <div className="text-center mt-10">Application not found.</div>;
  }

  console.log(application);

  return (
    <ProtectedRoute requiredRole="STAFF">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <Button variant="outline" onClick={() => router.back()}>
              &larr; Back to Applications
            </Button>
            <h1 className="text-3xl font-bold mt-4">Review Application #{application.id}</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Pet:</strong> {application.pet.name} ({application.pet.species.name} - {application.pet.breed.name})</p>
                  <p><strong>Adopter:</strong> {application.adopter.firstName} {application.adopter.lastName} ({application.adopter.email})</p>
                  <p><strong>Status:</strong> {application.status}</p>
                  <p><strong>Pet Status:</strong> {pet.status}</p>
                  <p><strong>Submitted:</strong> {new Date(application.createdAt).toLocaleString()}</p>
                  <hr className="my-4" />
                  <p><strong>Reason for Adoption:</strong> {application.reason}</p>
                  <p><strong>Experience with Pets:</strong> {application.experience || 'N/A'}</p>
                  <p><strong>Living Situation:</strong> {application.livingSituation || 'N/A'}</p>
                  <p><strong>Other Pets:</strong> {application.otherPets || 'N/A'}</p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button onClick={() => handleUpdateStatus('APPROVED')} variant="default" className="bg-green-500 hover:bg-green-600">
                    <Check className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button onClick={() => handleUpdateStatus('REJECTED')} variant="destructive">
                    <X className="h-4 w-4 mr-2" /> Reject
                  </Button>
                  <Button onClick={() => handleUpdateStatus('UNDER_REVIEW')} variant="outline">
                    Mark as Under Review
                  </Button>
                </CardContent>
              </Card>
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Internal Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {notes.map(note => (
                      <div key={note.id} className="p-2 bg-gray-100 rounded-lg">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-gray-500 text-right">
                          - {note.author.firstName} on {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Textarea 
                      value={newNote}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
                      placeholder="Add an internal note..."
                    />
                    <Button onClick={handleAddNote} className="mt-2 w-full">
                      <Send className="h-4 w-4 mr-2" /> Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
