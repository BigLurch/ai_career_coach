"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const loginSchema = z.object({
    email: z.string().email("Ange en giltig e-postadress"),
    password: z.string().min(6, "Lösenordet måste vara minst 6 tecken"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [serverError, setServerError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (values: LoginFormValues) => {
        setServerError("");
        setIsLoading(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (error) {
                setServerError(error.message);
                return;
            }

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
                <h1 className="mb-2 text-2xl font-bold">Logga in</h1>
                <p className="mb-6 text-sm text-gray-600">
                    Fortsätt där du slutade i din AI Career Coach.
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
                            placeholder="Ditt lösenord"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    {serverError && (
                        <p className="text-sm text-red-600">{serverError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
                    >
                        {isLoading ? "Loggar in..." : "Logga in"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-600">
                    Har du inget konto?{" "}
                    <Link href="/signup" className="font-medium text-black underline">
                        Skapa konto
                    </Link>
                </p>
            </div>
        </main>
    );
}