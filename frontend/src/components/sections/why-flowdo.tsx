"use client"

import { motion } from "framer-motion"
import { 
  Brain, 
  Clock, 
  Target, 
  BarChart3, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const problems = [
  "Switching between multiple productivity apps",
  "Losing focus due to constant interruptions", 
  "No clear connection between tasks and time",
  "Overwhelming to-do lists without prioritization",
  "Lack of insights into productivity patterns"
]

const advantages = [
  {
    icon: Brain,
    title: "Science-Backed Approach",
    description: "Built on the proven Pomodoro technique, scientifically shown to improve focus and reduce mental fatigue.",
    benefit: "25% improvement in sustained attention"
  },
  {
    icon: Target,
    title: "Seamless Task-Time Integration", 
    description: "Unlike other apps, FlowDo connects your tasks directly to focused work sessions, creating a natural workflow.",
    benefit: "No more context switching between apps"
  },
  {
    icon: BarChart3,
    title: "Intelligent Insights",
    description: "Get actionable insights about your productivity patterns, peak hours, and task completion rates.",
    benefit: "Data-driven productivity optimization"
  },
  {
    icon: Clock,
    title: "Flexible Time Management",
    description: "Customize your Pomodoro sessions, break times, and work schedules to match your natural rhythm.",
    benefit: "Works with your schedule, not against it"
  },
  {
    icon: Shield,
    title: "Privacy-First Design",
    description: "Your data stays secure with enterprise-grade encryption. We never sell or share your personal information.",
    benefit: "Complete peace of mind"
  },
  {
    icon: Smartphone,
    title: "Cross-Platform Sync",
    description: "Start on desktop, continue on mobile. Your tasks and timers sync seamlessly across all devices.",
    benefit: "Productivity anywhere, anytime"
  }
]

const competitors = [
  {
    feature: "Pomodoro Integration",
    flowdo: true,
    others: false,
    note: "Built-in, not an afterthought"
  },
  {
    feature: "Task-Time Connection",
    flowdo: true,
    others: false,
    note: "Seamless workflow"
  },
  {
    feature: "Focus Analytics",
    flowdo: true,
    others: false,
    note: "Understand your patterns"
  },
  {
    feature: "Distraction-Free Design",
    flowdo: true,
    others: false,
    note: "Clean, minimal interface"
  },
  {
    feature: "Free Tier",
    flowdo: true,
    others: true,
    note: "Generous free features"
  },
  {
    feature: "Mobile Apps",
    flowdo: true,
    others: true,
    note: "Native iOS & Android"
  }
]

export function WhyFlowDoSection() {
  return (
    <section id="why-flowdo" className="py-24 bg-gradient-to-b from-background to-accent/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose FlowDo?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Stop juggling multiple apps and start flowing. FlowDo is the only productivity tool that truly integrates task management with focused work sessions.
            </p>
          </motion.div>
        </div>

        {/* The Problem */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Tired of Productivity Theater?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Most people struggle with these common productivity challenges:
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3 mb-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-foreground">{problem}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* The FlowDo Advantage */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              The FlowDo Difference
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;ve solved these problems with a unique approach that puts flow state at the center of productivity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <motion.div
                key={advantage.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <advantage.icon className="h-8 w-8 text-primary mr-3" />
                  <h4 className="text-lg font-semibold text-foreground">
                    {advantage.title}
                  </h4>
                </div>
                <p className="text-muted-foreground mb-4">
                  {advantage.description}
                </p>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{advantage.benefit}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              FlowDo vs. Other Productivity Apps
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl overflow-hidden max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-3 bg-accent/50 p-4 font-semibold text-foreground">
              <div>Feature</div>
              <div className="text-center">FlowDo</div>
              <div className="text-center">Other Apps</div>
            </div>
            {competitors.map((comparison, index) => (
              <div
                key={comparison.feature}
                className={`grid grid-cols-3 p-4 items-center ${
                  index % 2 === 0 ? 'bg-accent/20' : ''
                }`}
              >
                <div className="font-medium text-foreground">
                  {comparison.feature}
                </div>
                <div className="text-center">
                  {comparison.flowdo ? (
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-6 w-6 text-red-500 mx-auto" />
                  )}
                </div>
                <div className="text-center">
                  {comparison.others ? (
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-6 w-6 text-red-500 mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Transform Your Productivity?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already discovered the power of focused, flow-state productivity.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}