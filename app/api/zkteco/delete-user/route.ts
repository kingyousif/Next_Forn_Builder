import { NextRequest, NextResponse } from "next/server";
import { deleteUserFromDevice } from "@/components/attendance";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const result = await deleteUserFromDevice(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in delete-user API:", error);
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
