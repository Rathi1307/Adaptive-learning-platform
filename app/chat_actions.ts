'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
export async function sendMessage(senderId: string, receiverId: string, content: string) {
    console.log(`[sendMessage] Attempting to send from ${senderId} to ${receiverId}`);
    try {
        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content
            }
        });
        revalidatePath('/dashboard/student');
        revalidatePath('/dashboard/teacher');
        return { success: true, message };
    } catch (error: any) {
        console.error("Send Message Error Full:", error);
        return { success: false, error: `Failed to send message: ${error.message}` };
    }
}

export async function getMessages(userId: string, otherUserId: string) {
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        return { success: true, messages };
    } catch (error) {
        console.error("Get Messages Error:", error);
        return { success: false, error: "Failed to fetch messages" };
    }
}
