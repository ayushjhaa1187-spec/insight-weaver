import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_CONTEXT = `You are analyzing the Enron Email Dataset (500K+ corporate emails from Enron Corporation) and AMI Meeting Corpus (279 meeting transcripts with summaries). These datasets contain corporate communications about energy trading, project management, regulatory compliance, and business operations.

Key entities found in analysis:
- Stakeholders: Kenneth Lay (CEO), Jeffrey Skilling (COO), Andrew Fastow (CFO), various VPs and managers
- Departments: Trading, Legal, Finance, Risk Management, IT, HR
- Key Projects: Online trading platform, Risk management system, Regulatory compliance framework
- Key Dates: Various board meetings, project deadlines, regulatory filing dates
- Risks: Market volatility, regulatory scrutiny, IT infrastructure scaling`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { source, documentContent, projectName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const context = source === "demo" ? DEMO_CONTEXT : 
      `You are analyzing the following uploaded documents:\n\n${documentContent || "No documents provided."}`;

    const systemPrompt = `You are a BRD (Business Requirements Document) generation agent. You analyze corporate communications (emails, meeting transcripts, chat logs) and produce structured, professional BRDs.

${context}

Generate a comprehensive BRD for "${projectName}" with these sections:

1. PROJECT OVERVIEW
- Project name, objective, scope, and background extracted from communications

2. STAKEHOLDERS
- Extract stakeholder names, roles, and their communication sources
- Format as a table

3. FUNCTIONAL REQUIREMENTS
- Extract and number each requirement (FR-001, FR-002, etc.)
- Include priority (High/Medium/Low) and source reference

4. NON-FUNCTIONAL REQUIREMENTS  
- Performance, security, scalability requirements extracted from discussions
- Number as NFR-001, etc.

5. RISKS & DEPENDENCIES
- Identified risks from communications
- Dependencies between teams/systems

6. SUCCESS METRICS
- KPIs and measurable outcomes mentioned in communications

7. TIMELINE & MILESTONES
- Key dates and deadlines extracted from communications

Write in professional, concise business language. Be specific with extracted data. Include source references where possible.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a complete BRD document for project "${projectName}". Analyze all available communications data and extract structured requirements.` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-brd error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
