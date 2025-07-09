"use client"

import { motion } from "framer-motion"
import { ArrowRight, Plus, Play, BarChart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const steps = [
  {
    step: "01",
    icon: Plus,
    title: "Create Your Tasks",
    description: "Add your tasks, set priorities, and organize them into projects. Our smart categorization helps you stay organized effortlessly.",
    features: ["Drag & drop organization", "Priority levels", "Project grouping", "Smart tags"]
  },
  {
    step: "02", 
    icon: Play,
    title: "Start Your Focus Session",
    description: "Launch a Pomodoro session for any task. The timer runs in the background while you work, automatically tracking your progress.",
    features: ["Customizable intervals", "Break reminders", "Background operation", "Distraction blocking"]
  },
  {
    step: "03",
    icon: BarChart,
    title: "Track Your Progress",
    description: "Review your productivity patterns, see completion rates, and get insights to optimize your workflow and maximize your efficiency.",
    features: ["Daily/weekly reports", "Productivity insights", "Goal tracking", "Performance trends"]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const stepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8
    }
  }
}

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            Simple 3-Step Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How{" "}
            <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
              FlowDo Works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes and transform your productivity with our intuitive three-step workflow. 
            It&apos;s designed to be simple, yet powerful enough for any project.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8 lg:space-y-12"
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={stepVariants}>
              <div className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}>
                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-teal-700 to-teal-500 text-white font-bold text-lg">
                      {step.step}
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl lg:text-3xl font-bold">
                      {step.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual representation */}
                <div className="flex-1 max-w-lg">
                  <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-border/50 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <step.icon className="h-12 w-12 mx-auto text-primary/60" />
                          <div className="space-y-2">
                            <div className="h-2 bg-primary/20 rounded-full w-24 mx-auto"></div>
                            <div className="h-2 bg-primary/30 rounded-full w-16 mx-auto"></div>
                            <div className="h-2 bg-primary/40 rounded-full w-20 mx-auto"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Arrow connector (except for the last step) */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-8 lg:my-12">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="p-3 rounded-full bg-primary/10"
                  >
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            Ready to transform your productivity?
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
            <span>Get started for free</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}