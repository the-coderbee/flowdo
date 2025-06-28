import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto space-y-8">
          <Image 
            src="/images/brand/logo-full-nobg.png" 
            alt="FlowDo Logo" 
            width={300} 
            height={100} 
            className="mx-auto"
          />
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Boost Your Productivity with <span className="text-primary">FlowDo</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Combine task management with the Pomodoro technique to stay focused, 
            organized, and productive throughout your day.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">Task Management</h3>
              <p className="text-muted-foreground">
                Create, organize, and prioritize your tasks with ease. Add subtasks, 
                due dates, and tags to stay organized.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">Pomodoro Timer</h3>
              <p className="text-muted-foreground">
                Stay focused with customizable Pomodoro sessions. Work in focused 
                sprints with timed breaks to maximize productivity.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your productivity with detailed stats and insights. See how 
                you spend your time and improve your workflow.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section id="pricing" className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of users who have improved their productivity with FlowDo.
          </p>
          
          <div className="max-w-sm mx-auto bg-card p-8 rounded-lg border shadow-sm">
            <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
            <div className="text-4xl font-bold mb-6">$0</div>
            <ul className="space-y-3 text-left mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Unlimited Tasks
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Pomodoro Timer
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Basic Statistics
              </li>
            </ul>
            <Button className="w-full" size="lg" asChild>
              <Link href="/register">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} FlowDo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
