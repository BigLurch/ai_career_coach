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

export type JobMatchAnalysis = {
    match_score: number;
    summary: string;
    strengths: string[];
    missing_skills: string[];
    keywords_to_add: string[];
    next_steps: string[];
};

export type JobMatchResponse = {
    status: string;
    cv_id: string;
    analysis: JobMatchAnalysis;
};