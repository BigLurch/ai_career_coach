"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { analyzeCv } from "@/lib/api";
import type { CVAnalysis } from "@/types/analysis";
import type { CvRecord } from "@/types/cv";

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [latestCv, setLatestCv] = useState<CvRecord | null>(null);
    const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);

    const fetchLatestCv = async () => {
        const supabase = createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            setErrorMessage("Du måste vara inloggad.");
            return;
        }

        const { data, error } = await supabase
            .from("cvs")
            .select("*")
            .eq("user_id", user.id)
            .order("uploaded_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            setErrorMessage(error.message);
            return;
        }

        setLatestCv(data);
    };

    useEffect(() => {
        fetchLatestCv();
    }, []);

    const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setAnalysis(null);

        const file = fileInputRef.current?.files?.[0];

        if (!file) {
            setErrorMessage("Välj en PDF-fil först.");
            return;
        }

        if (file.type !== "application/pdf") {
            setErrorMessage("Endast PDF-filer stöds just nu.");
            return;
        }

        setIsUploading(true);

        try {
            const supabase = createClient();

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                setErrorMessage("Du måste vara inloggad för att ladda upp ett CV.");
                return;
            }

            const sanitizedFileName = file.name.replace(/\s+/g, "-").toLowerCase();
            const filePath = `${user.id}/${Date.now()}-${sanitizedFileName}`;

            const { error: uploadError } = await supabase.storage
                .from("cv-files")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                setErrorMessage(uploadError.message);
                return;
            }

            const { error: insertError } = await supabase.from("cvs").insert({
                user_id: user.id,
                file_name: file.name,
                file_path: filePath,
                file_size: file.size,
                mime_type: file.type,
            });

            if (insertError) {
                setErrorMessage(insertError.message);
                return;
            }

            setSuccessMessage("CV uppladdat!");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await fetchLatestCv();
            router.refresh();
        } catch {
            setErrorMessage("Något gick fel vid uppladdningen.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!latestCv) {
            setErrorMessage("Inget CV hittades att analysera.");
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");
        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            const result = await analyzeCv(latestCv.id);
            setAnalysis(result.analysis);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Kunde inte analysera CV.";
            setErrorMessage(message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const formatFileSize = (size?: number | null) => {
        if (!size) return "Okänd storlek";
        const kb = size / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Okänt datum";
        return new Date(dateString).toLocaleString("sv-SE");
    };

    return (
        <main className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="rounded-2xl bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900">Ladda upp CV</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Ladda upp ditt CV som PDF för att använda AI Career Coach.
                    </p>

                    <form onSubmit={handleUpload} className="mt-6 space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                CV-fil
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                            />
                        </div>

                        {errorMessage && (
                            <p className="text-sm text-red-600">{errorMessage}</p>
                        )}

                        {successMessage && (
                            <p className="text-sm text-green-600">{successMessage}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isUploading}
                            className="rounded-lg bg-black px-5 py-3 text-white hover:opacity-90 disabled:opacity-50"
                        >
                            {isUploading ? "Laddar upp..." : "Ladda upp CV"}
                        </button>
                    </form>
                </div>

                <div className="rounded-2xl bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900">Senaste CV</h2>

                    {!latestCv ? (
                        <p className="mt-3 text-sm text-gray-600">
                            Du har inte laddat upp något CV ännu.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            <div className="rounded-xl border border-gray-200 p-4">
                                <p className="text-sm text-gray-500">Filnamn</p>
                                <p className="font-medium text-gray-900">{latestCv.file_name}</p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl border border-gray-200 p-4">
                                    <p className="text-sm text-gray-500">Storlek</p>
                                    <p className="font-medium text-gray-900">
                                        {formatFileSize(latestCv.file_size)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-200 p-4">
                                    <p className="text-sm text-gray-500">Uppladdat</p>
                                    <p className="font-medium text-gray-900">
                                        {formatDate(latestCv.uploaded_at)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-200 p-4">
                                    <p className="text-sm text-gray-500">CV ID</p>
                                    <p className="truncate font-medium text-gray-900">
                                        {latestCv.id}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-200 p-4">
                                    <p className="text-sm text-gray-500">Extraction status</p>
                                    <p className="font-medium text-gray-900">
                                        {latestCv.extraction_status || "pending"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="rounded-lg bg-black px-5 py-3 text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {isAnalyzing ? "Analyserar..." : "Analysera CV"}
                            </button>
                        </div>
                    )}
                </div>

                {analysis && (
                    <div className="rounded-2xl bg-white p-8 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">CV-analys</h2>
                            <div className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                                Score: {analysis.score}/100
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Sammanfattning</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-700">
                                    {analysis.summary}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Styrkor</h3>
                                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">
                                    {analysis.strengths.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Förbättringsområden
                                </h3>
                                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">
                                    {analysis.improvements.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Nästa steg</h3>
                                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">
                                    {analysis.next_steps.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}