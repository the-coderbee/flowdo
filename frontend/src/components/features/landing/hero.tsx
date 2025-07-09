"use client"

import { ArrowRight, Play, CheckCircle, Clock, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              ✨ Boost Your Productivity Today
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
              <span className="block">Master Your</span>
              <span className="block bg-gradient-to-r from-teal-700 via-teal-500 to-teal-600 bg-clip-text text-transparent">
                Focus & Flow
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Combine powerful task management with the proven Pomodoro Technique. 
              Transform your productivity with FlowDo&apos;s intuitive workflow that helps you stay focused, organized, and in control.
            </p>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-teal-600" />
              <span>Smart Task Management</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-500" />
              <span>Pomodoro Timer</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-700" />
              <span>Progress Tracking</span>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Button size="lg" className="px-8 py-4 text-lg font-semibold group">
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold group">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-12"
          >
            <p className="text-sm text-muted-foreground mb-8">
              Trusted by thousands of productive individuals worldwide
            </p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 border-2 border-background"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">2,500+ users</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}