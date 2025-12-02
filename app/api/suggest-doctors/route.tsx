import { openai } from "@/config/OpenModel";
import { AIDoctorAgents } from "@/shared/list";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { notes } = await req.json();
  try {
    const completion = await openai.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",
      messages: [
        {
          role: "system",
          content: `You are a medical assistant. Here are available doctors: ${JSON.stringify(
            AIDoctorAgents.map((d) => ({
              id: d.id,
              specialist: d.specialist,
            }))
          )}`,
        },
        {
          role: "user",
          content: `User Notes/Symptoms: ${notes}\n\nBased on the symptoms, suggest 2-3 doctors from the available list. Return ONLY a JSON array with objects containing "id" and "specialist" fields. Example: [{"id": 1, "specialist": "General Physician"}]`,
        },
      ],
    });

    const rawResp = completion.choices[0].message;
    // @ts-ignore - model returns content as string
    const Resp = rawResp.content
      .trim()
      .replace("```json", "")
      .replace("```", "");

    console.log("Raw LLM Response:", Resp);

    const JSONResp = JSON.parse(Resp);
    console.log("Parsed JSON:", JSONResp);

    // Normalize: handle both array and wrapped objects (doctors, suggestions, list, etc.)
    let suggestedDoctors: any = Array.isArray(JSONResp)
      ? JSONResp
      : JSONResp.doctors || JSONResp.suggestions || JSONResp.list || [];

    console.log("Before mapping:", suggestedDoctors);

    // Map back to full AIDoctorAgents objects so frontend always gets image/description/etc.
    suggestedDoctors = suggestedDoctors.map((doc: any) => {
      const matchedDoctor = AIDoctorAgents.find(
        (agent) =>
          agent.id === doc.id ||
          agent.specialist.toLowerCase() === doc.specialist?.toLowerCase() ||
          agent.specialist
            .toLowerCase()
            .includes(doc.specialist?.toLowerCase())
      );
      return matchedDoctor || doc;
    });

    console.log("After mapping:", suggestedDoctors);

    // Fallback: if model output is weird, still return 2-3 default doctors
    if (!Array.isArray(suggestedDoctors) || suggestedDoctors.length === 0) {
      return NextResponse.json(AIDoctorAgents.slice(0, 3));
    }

    return NextResponse.json(suggestedDoctors);
  } catch (e) {
    console.error("Suggest doctors error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
