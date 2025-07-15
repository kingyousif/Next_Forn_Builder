import { NextRequest, NextResponse } from "next/server";
import { bulkCreateUsers } from "@/components/attendance";

export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "users array is required and cannot be empty",
        },
        { status: 400 }
      );
    }

    // Validate each user object
    for (const user of users) {
      if (!user.userId || !user.userName) {
        return NextResponse.json(
          {
            success: false,
            message: "Each user must have userId and userName",
          },
          { status: 400 }
        );
      }
    }

    const result = await bulkCreateUsers(users);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in bulk-create-users API:", error);
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
