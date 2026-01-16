import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Users, BarChart3, Sparkles, Heart, Quote, GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white">
            <div className="h-8 w-8 relative flex items-center justify-center">
              <Image src="/logo-edusarthi.svg" alt="EduSarthi Logo" width={32} height={32} className="object-contain" />
            </div>
            <span>
              Edu<span className="font-light text-blue-400">Sarthi</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#mission" className="hover:text-white transition-colors">Our Mission</Link>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-slate-800 text-slate-300 hover:text-white">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
        {/* Abstract Background Shapes - Cool, trusting colors */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-slate-50">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-float" />
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-violet-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[60px] opacity-100 animate-float" style={{ animationDelay: "4s" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in-up">
            <Heart className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />
            <span>Learning made for everyone</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Every student learns <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">at their own pace.</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            We believe technology should adapt to the child, not the other way around. Our platform supports teachers in identifying gaps and helping every student shine.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200/50 transition-all hover:-translate-y-1">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-lg rounded-full text-slate-600 hover:bg-slate-100">
                Teacher Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Human-Centric Features */}
      <section id="mission" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                More than just code.<br />
                <span className="text-blue-600">It's a helping hand.</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                In a crowded classroom, it's easy for quiet students to get left behind. We give teachers a "sixth sense" to spot who needs help and who is ready to fly.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: <BrainCircuit className="h-6 w-6 text-blue-600" />,
                    title: "Patience Built-In",
                    desc: "If a concept doesn't stick, the system gently offers simpler steps until it clicks."
                  },
                  {
                    icon: <Users className="h-6 w-6 text-slate-700" />,
                    title: "No One is Invisible",
                    desc: "Teachers get a clear view of every single student's struggle and success."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 bg-blue-50 p-3 rounded-xl h-fit">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-slate-200 rounded-[2rem] transform rotate-3 scale-95 opacity-50" />
              <div className="relative bg-slate-50 border border-slate-200 p-8 rounded-[2rem] shadow-xl">
                {/* Abstract UI representation of "Care" */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden relative">
                    {/* Avatar Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-400">IMG</div>
                  </div>
                  <div>
                    <div className="h-4 w-32 bg-slate-200 rounded-full mb-2" />
                    <div className="h-3 w-20 bg-slate-100 rounded-full" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-sm">
                    "Hey Aarav, looks like you're stuck on <b>Linear Equations</b>. Let's try a video example?"
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-100 text-slate-600 text-sm flex justify-between items-center shadow-sm">
                    <span>Watch "Balancing the Scales"</span>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="h-8 w-8 relative flex items-center justify-center">
              <Image src="/logo-edusarthi.svg" alt="EduSarthi Logo" width={32} height={32} className="object-contain" />
            </div>
            <span>EduSarthi</span>
          </div>

          <p className="text-slate-500 text-sm">
            Built with ❤️ for the future of India.
          </p>

          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
