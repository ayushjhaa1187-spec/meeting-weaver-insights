import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Github, Mail } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Zap className="h-6 w-6 text-primary" />
            <span>BRD Agent</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth?mode=login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
              Transform Scattered Communications Into <span className="text-primary">Structured Requirements</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              A multi-agent AI system processing 500K+ emails and transcripts with 92%+ accuracy and &lt;3s latency.
            </p>
            <div className="space-x-4">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard?demo=true">
                <Button variant="outline" size="lg">View Demo</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-4">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">500K+</h3>
                  <p className="text-sm text-muted-foreground">Emails Processed</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">279</h3>
                  <p className="text-sm text-muted-foreground">Transcripts Analyzed</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">92%</h3>
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">&lt;3s</h3>
                  <p className="text-sm text-muted-foreground">Latency per BRD</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="auth" className="container py-8 md:py-12 lg:py-24">
           <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
             <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">Ready to automate your requirements?</h2>
             <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
               Join thousands of product managers saving hours every week.
             </p>
             <div className="flex flex-col gap-4 w-full max-w-sm">
                <Button variant="outline" className="w-full gap-2">
                  <Github className="h-4 w-4" /> Continue with GitHub
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="h-4 w-4" /> Continue with Email
                </Button>
             </div>
           </div>
        </section>
      </main>
    </div>
  );
}
