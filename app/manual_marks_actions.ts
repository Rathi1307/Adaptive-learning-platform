"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addOfflineMark(studentId: string, subject: string, score: number, totalMarks: number) {
    try {
        const mark = await prisma.offlineMark.create({
            data: {
                studentId,
                subject,
                score,
                totalMarks
            }
        });
        revalidatePath('/dashboard/teacher');
        return { success: true, mark };
    } catch (error) {
        console.error("Failed to add offline mark:", error);
        return { success: false, error: "Failed to add mark" };
    }
}

export async function getOfflineMarks(studentId: string) {
    try {
        const marks = await prisma.offlineMark.findMany({
            where: { studentId },
            orderBy: { testDate: 'desc' }
        });
        return { success: true, marks };
    } catch (error) {
        console.error("Failed to fetch offline marks:", error);
        return { success: false, error: "Failed to fetch marks" };
    }
}
