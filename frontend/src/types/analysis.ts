export type CVAnalysis = {
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    next_steps: string[];
};

export type CVAnalysisResponse = {
    status: string;
    cv_id: string;
    analysis: CVAnalysis;
};