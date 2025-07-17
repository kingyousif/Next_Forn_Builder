import { NextRequest, NextResponse } from "next/server";
import { getUsersFromDevice } from "@/components/attendance";

export async function POST(request: NextRequest) {
  try {
    const result = await getUsersFromDevice();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in get-users API:", error);
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
