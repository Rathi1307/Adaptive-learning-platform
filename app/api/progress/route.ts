import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            progress: true,
        },
    });

    const courses = await prisma.course.findMany({
        include: {
            modules: {
                include: {
                    chapters: true,
                },
            },
        },
    });

    return NextResponse.json({ progress: user?.progress || [], courses });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chapterId, status } = await req.json();

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const progress = await prisma.progress.upsert({
        where: {
            userId_chapterId: {
                userId: user.id,
                chapterId,
            },
        },
        update: {
            status,
            completedAt: status === "COMPLETED" ? new Date() : null,
        },
        create: {
            userId: user.id,
            chapterId,
            status,
            completedAt: status === "COMPLETED" ? new Date() : null,
        },
    });

    return NextResponse.json(progress);
}
