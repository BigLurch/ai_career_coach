const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getBackendHealth() {
    const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch backend health");
    }

    return response.json();
}

export async function analyzeCv(cvId: string) {
    const response = await fetch(`${API_BASE_URL}/analysis/cv/${cvId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to analyze CV");
    }

    return response.json();
}