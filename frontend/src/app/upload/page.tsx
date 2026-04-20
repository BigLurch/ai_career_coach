"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

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

            router.refresh();
        } catch {
            setErrorMessage("Något gick fel vid uppladdningen.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="mx-auto max-w-2xl">
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
            </div>
        </main>
    );
}