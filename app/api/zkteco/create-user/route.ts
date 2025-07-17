import { NextRequest, NextResponse } from "next/server";
import { createUserOnDevice } from "@/components/attendance";

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, password, privilege, cardNumber } =
      await request.json();

    if (!userId || !userName) {
      return NextResponse.json(
        { success: false, message: "userId and userName are required" },
        { status: 400 }
      );
    }

    const result = await createUserOnDevice(
      userId,
      userName,
      password || "",
      privilege || 0,
      cardNumber || ""
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in create-user API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
