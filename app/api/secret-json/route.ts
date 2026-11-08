import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/crypto";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let text = "";
    let validity = "60";
    let viewLimitSet: any = null;
    let viewLimit: any = null;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      text = body.text || "";
      validity = body.validity || "60";
      viewLimitSet = body.viewLimitSet;
      viewLimit = body.viewLimit;
    } else {
      const formData = await req.formData();
      text = (formData.get("text") as string) || "";
      validity = (formData.get("validity") as string) || "60";
      viewLimitSet = formData.get("viewLimitSet");
      viewLimit = formData.get("viewLimit") as string;
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "Secret text is required" }, { status: 400 });
    }

    const encryptedText = encrypt(text);
    const expirationTime = parseInt(validity || "60") * 60 * 1000 + Date.now();
    const calculatedViewLimit =
      (viewLimitSet === "on" || viewLimitSet === true || viewLimitSet === "true") && viewLimit
        ? Math.round(parseFloat(viewLimit) * 60 * 1000)
        : null;

    const { data, error } = await supabase
      .from("FlashTexts")
      .insert([
        {
          encryptedText,
          expirationTime,
          viewLimit: calculatedViewLimit,
        },
      ])
      .select();

    if (error || !data || data.length === 0) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to store secret in database" }, { status: 500 });
    }

    const id = data[0].id;
    const origin = req.nextUrl.origin;
    return NextResponse.json({ id, link: origin });
  } catch (err: any) {
    console.error("Secret API error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

