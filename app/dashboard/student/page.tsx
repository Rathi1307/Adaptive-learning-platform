import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentDashboardData } from "@/app/actions";
import StudentDashboardClient from "./client";

export default async function StudentDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    let dashboardData;
    try {
        // Fetch data for the logged in student
        // Fallback to a seeded student if necessary for demo, but preferred to be strict
        dashboardData = await getStudentDashboardData(session.user.email || '');
    } catch (error) {
        console.error("Failed to fetch student dashboard data:", error);
        // If we can't find the student (maybe using a different email than seeded), redirect or error
        // For demo stability, we might want to fallback to a known seeded student email if development mode
        // But let's assume login uses valid seeded credentials.
        return <div>Error loading dashboard. Please contact support.</div>;
    }

    return (
        <StudentDashboardClient
            userData={session.user}
            initialData={dashboardData}
        />
    );
}
