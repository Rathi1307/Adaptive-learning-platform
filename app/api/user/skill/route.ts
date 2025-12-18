import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { skillLevel } = await req.json();

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: { skillLevel },
        });

        return NextResponse.json({ message: "Skill level updated", user });
    } catch (error) {
        return NextResponse.json({ message: "Error updating skill level" }, { status: 500 });
    }
}
