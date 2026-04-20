import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { getBackendHealth } from "@/lib/api";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    let backendStatus = "Unavailable";
    let backendService = "Unknown";

    try {
        const health = await getBackendHealth();
        backendStatus = health.status;
        backendService = health.service;
    } catch {
        backendStatus = "error";
        backendService = "Could not connect";
    }

    return (
        <main className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Välkommen tillbaka, {user.email}
                        </p>
                    </div>
                    <LogoutButton />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">CV Upload</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Nästa steg blir att ladda upp ditt CV som PDF.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Jobbmatchning</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Klistra in en jobbannons för att analysera matchning och skill gaps.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Career Roadmap</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Få en konkret plan mot rollen du siktar på.
                        </p>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Backend Status</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Status: <span className="font-medium text-gray-900">{backendStatus}</span>
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                        Service: <span className="font-medium text-gray-900">{backendService}</span>
                    </p>
                </div>
            </div>
        </main>
    );
}