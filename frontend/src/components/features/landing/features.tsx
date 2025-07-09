"use client"

import { motion } from "framer-motion"
import { 
  CheckSquare, 
  Timer, 
  BarChart3, 
  Zap, 
  Users, 
  Shield,
  Smartphone,
  Cloud,
  Brain
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: CheckSquare,
    title: "Smart Task Management",
    description: "Organize your tasks with intuitive drag-and-drop, priorities, and smart categorization that adapts to your workflow.",
    color: "text-teal-600"
  },
  {
    icon: Timer,
    title: "Pomodoro Integration",
    description: "Built-in Pomodoro timer with customizable intervals, break reminders, and automatic task tracking for peak focus.",
    color: "text-teal-700"
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Detailed insights into your productivity patterns, completion rates, and time spent to optimize your workflow.",
    color: "text-teal-500"
  },
  {
    icon: Brain,
    title: "Focus Sessions",
    description: "Deep work sessions with distraction blocking, ambient sounds, and flow state optimization techniques.",
    color: "text-teal-600"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share projects, assign tasks, and track team progress with real-time updates and seamless communication.",
    color: "text-gray-600"
  },
  {
    icon: Cloud,
    title: "Cross-Platform Sync",
    description: "Access your tasks and timers across all devices with instant synchronization and offline capability.",
    color: "text-teal-500"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
}

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
              Stay Productive
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            FlowDo combines the best of task management and time tracking in one beautifully designed, 
            distraction-free workspace that adapts to your unique productivity style.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className={`inline-flex p-3 rounded-lg bg-muted/50 ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional features showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-teal-600" />
              </div>
              <h4 className="font-semibold">Mobile Ready</h4>
              <p className="text-sm text-muted-foreground">iOS & Android apps</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Shield className="h-8 w-8 text-teal-700" />
              </div>
              <h4 className="font-semibold">Secure & Private</h4>
              <p className="text-sm text-muted-foreground">End-to-end encryption</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Zap className="h-8 w-8 text-teal-500" />
              </div>
              <h4 className="font-semibold">Lightning Fast</h4>
              <p className="text-sm text-muted-foreground">Instant sync & updates</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <h4 className="font-semibold">Team Ready</h4>
              <p className="text-sm text-muted-foreground">Collaboration tools</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}