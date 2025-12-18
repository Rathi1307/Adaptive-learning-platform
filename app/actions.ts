'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTeacherDashboardData(teacherEmail: string) {
    const teacher = await prisma.user.findUnique({
        where: { email: teacherEmail },
    })

    if (!teacher) throw new Error("Teacher not found")

    // Fetch clusters (all clusters for now, or filter by teacher if we had that relation)
    const clusters = await prisma.cluster.findMany({
        include: {
            students: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    progress: true,
                    skillLevel: true,
                    role: true,
                    quizResults: {
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            quiz: {
                                include: {
                                    chapter: {
                                        select: { title: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    // Compute simple class performance stats
    // In a real app, this would aggregate actual quiz results
    const classPerformance = [
        { name: "Mathematics", avgScore: 72, completed: 65, fill: "#3b82f6" },
        { name: "Science", avgScore: 68, completed: 55, fill: "#10b981" },
        { name: "Social Sci", avgScore: 82, completed: 75, fill: "#f59e0b" },
        { name: "English", avgScore: 88, completed: 90, fill: "#d946ef" },
    ]

    return {
        clusters: clusters.map(c => ({
            ...c,
            schedule: c.schedule ? JSON.parse(c.schedule) : null,
            checklist: c.checklist ? JSON.parse(c.checklist) : [],
            studentIds: c.students.map(s => s.id)
        })),
        students: clusters.flatMap(c => c.students),
        classPerformance
    }
}

export async function getStudentDashboardData(studentEmail: string) {
    const student = await prisma.user.findUnique({
        where: { email: studentEmail },
        include: {
            progress: true
        }
    })

    if (!student) throw new Error("Student not found")

    const courses = await prisma.course.findMany({
        include: {
            modules: {
                include: {
                    chapters: {
                        include: {
                            progress: {
                                where: { userId: student.id }
                            }
                        }
                    }
                }
            }
        }
    })

    // Transform courses to include progress status directly on chapters
    const transformedCourses = courses.map(course => ({
        ...course,
        modules: course.modules.map(mod => ({
            ...mod,
            chapters: mod.chapters.map(chap => ({
                ...chap,
                subtopics: chap.subtopics ? JSON.parse(chap.subtopics) : [],
                isCompleted: chap.progress.length > 0 && chap.progress[0].status === 'COMPLETED'
            }))
        }))
    }))

    return {
        student,
        courses: transformedCourses
    }
}

export async function updateChapterProgress(studentEmail: string, chapterId: string, completed: boolean) {
    const student = await prisma.user.findUnique({ where: { email: studentEmail } })
    if (!student) throw new Error("User not found")

    if (completed) {
        await prisma.progress.upsert({
            where: {
                userId_chapterId: {
                    userId: student.id,
                    chapterId: chapterId
                }
            },
            update: { status: 'COMPLETED', completedAt: new Date() },
            create: {
                userId: student.id,
                chapterId: chapterId,
                status: 'COMPLETED',
                completedAt: new Date()
            }
        })
    } else {
        // If unchecking, we can remove the progress or set to PENDING
        // For now, let's delete it or set to PENDING
        await prisma.progress.deleteMany({
            where: {
                userId: student.id,
                chapterId: chapterId
            }
        })
    }

    revalidatePath('/dashboard/student')
}

import { generateQuizQuestions } from "@/lib/ai";

export async function generateQuizAction(chapterId: string) {
    // 1. Get chapter details
    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId }
    });

    if (!chapter) throw new Error("Chapter not found");

    // 2. Call AI Service
    const questions = await generateQuizQuestions(chapter.title, chapter.difficulty || "Medium");

    // 3. Save Quiz to DB
    const quiz = await prisma.quiz.create({
        data: {
            chapterId: chapter.id,
            questions: JSON.stringify(questions)
        }
    });

    return quiz.id;
}

export async function submitQuizResult(quizId: string, studentEmail: string, score: number, totalQuestions: number) {
    const student = await prisma.user.findUnique({ where: { email: studentEmail } });
    if (!student) throw new Error("Student not found");

    // Create Result
    await prisma.quizResult.create({
        data: {
            quizId,
            userId: student.id,
            score: Math.round((score / totalQuestions) * 100),
            report: `Scored ${score} out of ${totalQuestions}`
        }
    });

    // If score > 70%, mark chapter as completed
    // (We'd typically fetch the quiz -> chapter connection here)
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { chapter: true }
    });

    if (quiz && (score / totalQuestions) >= 0.7) {
        await updateChapterProgress(studentEmail, quiz.chapterId, true);
    }

    revalidatePath('/dashboard/student');
    revalidatePath('/dashboard/teacher');
}
