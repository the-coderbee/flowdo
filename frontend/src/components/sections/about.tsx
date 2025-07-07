"use client"

import { motion } from "framer-motion"
import { Heart, Target, Users, Lightbulb, Globe, Award } from "lucide-react"

const values = [
  {
    icon: Target,
    title: "Focus-First Design",
    description: "We believe productivity comes from deep focus, not busy work. Every feature is designed to minimize distractions and maximize concentration."
  },
  {
    icon: Users,
    title: "User-Centric Approach", 
    description: "Our users&apos; needs drive every decision. We listen, iterate, and continuously improve based on real feedback from our community."
  },
  {
    icon: Lightbulb,
    title: "Science-Backed Methods",
    description: "We build on proven productivity techniques like the Pomodoro method, backed by research and adapted for modern workflows."
  },
  {
    icon: Globe,
    title: "Accessible to All",
    description: "Productivity tools should be available to everyone. We&apos;re committed to building inclusive, accessible software that works for all users."
  }
]

const stats = [
  { number: "2,500+", label: "Active Users" },
  { number: "50K+", label: "Tasks Completed" },
  { number: "15K+", label: "Pomodoro Sessions" },
  { number: "98%", label: "User Satisfaction" }
]

const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    description: "Former productivity consultant with 10+ years helping teams optimize their workflows.",
    avatar: "SC"
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO & Co-Founder", 
    description: "Full-stack engineer passionate about building tools that make a real difference in people&apos;s lives.",
    avatar: "MR"
  },
  {
    name: "Elena Vasquez",
    role: "Head of Design",
    description: "UX designer focused on creating intuitive, beautiful interfaces that enhance productivity.",
    avatar: "EV"
  },
  {
    name: "David Kim",
    role: "Lead Developer",
    description: "Backend specialist ensuring FlowDo runs smoothly and securely for thousands of users.",
    avatar: "DK"
  }
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background">
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
              About FlowDo
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We&apos;re on a mission to help people achieve more by doing less. FlowDo was born from the frustration of juggling multiple productivity tools that promised everything but delivered complexity.
            </p>
          </motion.div>
        </div>

        {/* Story Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8 md:p-12"
          >
            <div className="flex items-center mb-6">
              <Heart className="h-8 w-8 text-red-500 mr-4" />
              <h3 className="text-2xl font-bold text-foreground">Our Story</h3>
            </div>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                FlowDo started in 2023 when our founders, Sarah and Marcus, realized they were spending more time managing their productivity tools than actually being productive. After trying dozens of apps, they decided to build something different.
              </p>
              <p className="mb-4">
                We believe that the best productivity system is the one you actually use. That&apos;s why FlowDo combines the proven Pomodoro technique with intuitive task management, creating a seamless flow between planning and execution.
              </p>
              <p>
                Today, we&apos;re proud to help thousands of individuals and teams around the world achieve their goals while maintaining a healthy work-life balance.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Our Values
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do, from product development to customer support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h4>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary/10 to-accent/20 rounded-2xl p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                FlowDo by the Numbers
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Team Section */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Meet Our Team
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;re a small but mighty team of productivity enthusiasts, designers, and engineers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {member.avatar}
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-1">
                  {member.name}
                </h4>
                <p className="text-primary text-sm mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-muted-foreground">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}