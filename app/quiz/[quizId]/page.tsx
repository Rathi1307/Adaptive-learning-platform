import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // Adjust if prisma is exported from elsewhere
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import QuizRunner from "./client";

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) redirect('/login');

    const { quizId } = await params;

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId }
    });

    if (!quiz) notFound();

    const questions = JSON.parse(quiz.questions);

    return <QuizRunner quizId={quiz.id} questions={questions} userEmail={session.user.email!} />;
}
