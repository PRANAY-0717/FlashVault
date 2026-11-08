import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("FlashTexts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Secret already opened or not found" },
        { status: 404 }
      );
    } else if (data.expirationTime < Date.now()) {
      await supabase.from("FlashTexts").delete().eq("id", id);
      return NextResponse.json({ error: "Secret expired" }, { status: 408 });
    }

    const secret = decrypt(data.encryptedText);
    const limitTime = data.viewLimit;

    // Burn on read: Delete immediately from database
    await supabase.from("FlashTexts").delete().eq("id", id);

    return NextResponse.json({ secret, limitTime });
  } catch (err: any) {
    console.error("Text API error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

