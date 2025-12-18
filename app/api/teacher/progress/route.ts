import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "TEACHER") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { studentId, chapterId, status } = await req.json();

    const progress = await prisma.progress.upsert({
        where: {
            userId_chapterId: {
                userId: studentId,
                chapterId,
            },
        },
        update: {
            status,
            completedAt: status === "COMPLETED" ? new Date() : null,
        },
        create: {
            userId: studentId,
            chapterId,
            status,
            completedAt: status === "COMPLETED" ? new Date() : null,
        },
    });

    return NextResponse.json(progress);
}
