import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "TEACHER") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const students = await prisma.user.findMany({
        where: { role: "STUDENT" },
        include: {
            progress: true,
        },
    });

    return NextResponse.json(students);
}
