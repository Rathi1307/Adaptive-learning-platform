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
        dashboardData = await getStudentDashboardData(session.user.email || '');
    } catch (error: any) {
        console.error("Failed to fetch student dashboard data:", error);

        // If student not found in DB (e.g. after re-seed), redirect to login to force fresh session/signup
        if (error.message?.includes("STUDENT_NOT_FOUND")) {
            redirect('/login');
        }

        return <div>Error loading dashboard. Please contact support.</div>;
    }

    return (
        <StudentDashboardClient
            userData={session.user}
            initialData={dashboardData}
        />
    );
}
