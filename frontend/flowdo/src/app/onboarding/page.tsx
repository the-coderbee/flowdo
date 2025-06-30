import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Logo Background */}
      <section className="relative h-[60vh] flex items-center">
        <div className="absolute top-0 left-0 -right-100 -bottom-60 -z-10 opacity-10">
          <Image
            src="/images/brand/logo-abs-nobg.png"
            alt="FlowDo Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary">
              Welcome to FlowDo
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-foreground/80">
              The smart way to manage tasks and boost productivity with seamless Pomodoro integration.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="text-base px-8 py-6"
                asChild
              >
                <Link href="/register">
                  Get Started
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base px-8 py-6"
                asChild
              >
                <Link href="/login">
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-accent/10" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Powerful Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-background rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Task Management</h3>
              <p className="text-foreground/70">
                Create, organize, and track tasks with ease. Set priorities, deadlines, and categories to keep everything in order.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-background rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-secondary/10 text-secondary flex items-center justify-center rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Pomodoro Timer</h3>
              <p className="text-foreground/70">
                Stay focused and productive with built-in Pomodoro techniques. Customize work and break intervals to match your workflow.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-background rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-accent/15 text-accent-foreground flex items-center justify-center rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Performance Analytics</h3>
              <p className="text-foreground/70">
                Visualize your productivity trends with detailed analytics. Understand your work patterns and optimize your time management.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-12">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Create Your Tasks</h3>
                  <p className="text-foreground/70">
                    Add tasks, set priorities, deadlines, and organize them into groups or categories.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Start Pomodoro Session</h3>
                  <p className="text-foreground/70">
                    Select a task and start a focused work session using the Pomodoro technique.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Track Progress</h3>
                  <p className="text-foreground/70">
                    Monitor your progress, complete tasks, and visualize your productivity over time.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-accent/5 p-8 rounded-lg border border-border">
              <div className="aspect-video rounded-lg overflow-hidden bg-primary/5 flex items-center justify-center">
                <svg className="w-16 h-16 text-primary/30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <p className="text-center mt-4 text-sm text-muted-foreground">
                Video demonstration available soon
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-secondary" id="pricing">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-secondary-foreground mb-6">
            Ready to boost your productivity?
          </h2>
          <p className="text-xl text-secondary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their workflow with FlowDo.
          </p>
          <Button 
            size="lg" 
            className="text-base px-8 py-6 bg-background text-foreground hover:bg-background/90"
            asChild
          >
            <Link href="/register">
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
} 