import { db } from "@/config/db";
import { SessionChatTable, usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const { notes, selectedDoctor } = await req.json();
  const user = await currentUser();

  if (!user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    // Make sure user exists in DB so createdBy foreign key doesn't fail
    const email = user.primaryEmailAddress?.emailAddress || "";

    if (email) {
      const existing = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

      if (!existing || existing.length === 0) {
        await db.insert(usersTable).values({
          name: user.fullName || "Unknown",
          email,
          credits: 10,
        });
      }
    }

    const sessionId = uuidv4();

    const result = await db
      .insert(SessionChatTable)
      .values({
        sessionId,
        createdBy: email || null,
        notes: notes || "",
        selectedDoctor: selectedDoctor || null,
        createdOn: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ sessionId, data: result[0] });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const user = await currentUser();

  const result = await db
    .select()
    .from(SessionChatTable)
    .where(eq(SessionChatTable.sessionId, sessionId || ""));

  return NextResponse.json(result[0] );
}
