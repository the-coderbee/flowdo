"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer",
    company: "TechFlow",
    avatar: "SC",
    content: "FlowDo completely transformed how I manage my design projects. The Pomodoro integration keeps me focused, and I&apos;ve increased my productivity by 40% in just two weeks.",
    rating: 5,
    color: "from-teal-400 to-teal-600"
  },
  {
    name: "Marcus Rodriguez",
    role: "Software Engineer",
    company: "InnovateLab",
    avatar: "MR",
    content: "As a developer, I needed something that wouldn&apos;t interrupt my flow. FlowDo&apos;s background timer and smart notifications are perfect. Best productivity app I&apos;ve used.",
    rating: 5,
    color: "from-teal-500 to-teal-700"
  },
  {
    name: "Emily Watson",
    role: "Marketing Manager",
    company: "GrowthCo",
    avatar: "EW",
    content: "The analytics feature is a game-changer. I can see exactly where my time goes and optimize my schedule. My team productivity has improved dramatically.",
    rating: 5,
    color: "from-gray-500 to-gray-700"
  },
  {
    name: "David Kim",
    role: "Freelance Writer",
    company: "Independent",
    avatar: "DK",
    content: "FlowDo helps me stay disciplined with my writing schedule. The focus sessions and progress tracking keep me motivated to hit my daily word count goals.",
    rating: 5,
    color: "from-teal-600 to-teal-800"
  },
  {
    name: "Lisa Thompson",
    role: "Project Manager",
    company: "BuildRight",
    avatar: "LT",
    content: "Managing multiple projects was chaos before FlowDo. Now I have complete visibility into task progress and can allocate resources more effectively.",
    rating: 5,
    color: "from-slate-500 to-slate-700"
  },
  {
    name: "Alex Johnson",
    role: "Entrepreneur",
    company: "StartupVenture",
    avatar: "AJ",
    content: "FlowDo is essential for my startup workflow. It keeps me organized and focused on high-priority tasks. The time tracking helps me make better business decisions.",
    rating: 5,
    color: "from-teal-400 to-teal-600"
  }
]

const benefits = [
  {
    stat: "40%",
    label: "Increase in Productivity",
    description: "Users report significant productivity gains within the first week"
  },
  {
    stat: "85%",
    label: "Better Focus",
    description: "Improved concentration and reduced distractions during work sessions"
  },
  {
    stat: "60%",
    label: "Faster Task Completion",
    description: "Complete projects ahead of schedule with better time management"
  },
  {
    stat: "95%",
    label: "User Satisfaction",
    description: "Consistently rated as the best productivity tool by our users"
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

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-muted/20">
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
            ⭐ Loved by Thousands
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            What Our Users{" "}
            <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
              Are Saying
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of professionals who have transformed their productivity with FlowDo. 
            See how it can make a difference in your workflow too.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={itemVariants} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                {benefit.stat}
              </div>
              <div className="font-semibold mb-1">{benefit.label}</div>
              <div className="text-sm text-muted-foreground">{benefit.description}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Quote icon */}
                    <Quote className="h-8 w-8 text-primary/30" />
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Testimonial content */}
                    <p className="text-muted-foreground leading-relaxed">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>

                    {/* Author info */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${testimonial.color} flex items-center justify-center text-white font-semibold text-sm`}>
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom testimonial highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center max-w-4xl mx-auto"
        >
          <Card className="border-0 bg-gradient-to-r from-teal-500/5 to-teal-700/5 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm font-medium">4.9/5 average rating</span>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                &ldquo;FlowDo has become an indispensable part of our team&apos;s workflow. The combination of task management and time tracking in one seamless interface is exactly what we needed.&rdquo;
              </p>
              <div className="text-sm">
                <span className="font-semibold">Jennifer Martinez</span>
                <span className="text-muted-foreground"> • Team Lead at Microsoft</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}