import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const math = await prisma.course.create({
            data: {
                title: "Mathematics",
                description: "Basic to Advanced Mathematics",
                standard: "All",
                chapters: {
                    create: [
                        { title: "Algebra Basics", content: "Introduction to Algebra" },
                        { title: "Geometry", content: "Shapes and Angles" },
                        { title: "Calculus", content: "Derivatives and Integrals" },
                    ],
                },
            },
        });

        const science = await prisma.course.create({
            data: {
                title: "Science",
                description: "Physics, Chemistry, and Biology",
                standard: "All",
                chapters: {
                    create: [
                        { title: "Newton's Laws", content: "Physics Basics" },
                        { title: "Periodic Table", content: "Chemistry Basics" },
                        { title: "Cell Structure", content: "Biology Basics" },
                    ],
                },
            },
        });

        return NextResponse.json({ message: "Seeded successfully", math, science });
    } catch (error) {
        return NextResponse.json({ message: "Error seeding", error }, { status: 500 });
    }
}
