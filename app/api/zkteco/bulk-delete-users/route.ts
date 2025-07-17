import { NextRequest, NextResponse } from "next/server";
import { bulkDeleteUsers } from "@/components/attendance";

export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "userIds array is required and cannot be empty",
        },
        { status: 400 }
      );
    }

    const result = await bulkDeleteUsers(userIds);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in bulk-delete-users API:", error);
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

