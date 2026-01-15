import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTeacherDashboardData } from "@/app/actions";
import TeacherDashboardClient from "./client";

export default async function TeacherDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'TEACHER') {
        redirect('/login');
    }

    // In a real scenario, we'd fetch data specific to the logged-in teacher
    // For this demo/prototype, we use the specific teacher email from seeding or fallback
    // Since our seed created 'teacher@demo.com', we should ensure we fetch that or current user if valid

    // Attempt to fetch data for the logged in user, or fallback if using a different seeded account
    let dashboardData;
    try {
        dashboardData = await getTeacherDashboardData(session.user.email || 'teacher@school.com');
    } catch (error) {
        // Fallback or empty state
        console.error("Failed to fetch dashboard data:", error);
        dashboardData = { clusters: [], students: [], classPerformance: [] };
    }

    return (
        <TeacherDashboardClient
            userData={session.user}
            initialData={dashboardData}
        />
    );
}
