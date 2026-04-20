"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const signupSchema = z.object({
    email: z.string().email("Ange en giltig e-postadress"),
    password: z.string().min(6, "Lösenordet måste vara minst 6 tecken"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (values: SignupFormValues) => {
        setServerError("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
            });

            if (error) {
                setServerError(error.message);
                return;
            }

            setSuccessMessage("Konto skapat. Kontrollera din e-post för att verifiera kontot om det krävs.");
            router.push("/dashboard");
            router.refresh();
        } catch {
            setServerError("Något gick fel. Försök igen.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="mb-2 text-2xl font-bold">Skapa konto</h1>
                <p className="mb-6 text-sm text-gray-600">
                    Börja bygga din väg mot nästa drömjobb.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">E-post</label>
                        <input
                            type="email"
                            {...register("email")}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
                            placeholder="du@exempel.se"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Lösenord</label>
                        <input
                            type="password"
                            {...register("password")}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
                            placeholder="Minst 6 tecken"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    {serverError && (
                        <p className="text-sm text-red-600">{serverError}</p>
                    )}

                    {successMessage && (
                        <p className="text-sm text-green-600">{successMessage}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
                    >
                        {isLoading ? "Skapar konto..." : "Skapa konto"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-600">
                    Har du redan ett konto?{" "}
                    <Link href="/login" className="font-medium text-black underline">
                        Logga in
                    </Link>
                </p>
            </div>
        </main>
    );
}