"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "What makes FlowDo different from other productivity apps?",
    answer: "FlowDo uniquely combines task management with the Pomodoro technique, providing seamless integration between planning and execution. Our smart analytics help you understand your productivity patterns and optimize your workflow for maximum efficiency."
  },
  {
    question: "Is FlowDo free to use?",
    answer: "Yes! FlowDo offers a generous free plan that includes core task management, basic Pomodoro timers, and progress tracking. Premium plans unlock advanced features like team collaboration, detailed analytics, and priority support."
  },
  {
    question: "Can I sync FlowDo across multiple devices?",
    answer: "Absolutely! FlowDo automatically syncs your tasks, timers, and progress across all your devices. Start a Pomodoro session on your desktop and seamlessly continue on your phone or tablet."
  },
  {
    question: "How does the Pomodoro technique work in FlowDo?",
    answer: "FlowDo implements the classic 25-minute work sessions followed by 5-minute breaks. You can customize timer durations, track completed sessions, and see how Pomodoro sessions relate to your task completion rates."
  },
  {
    question: "Can I collaborate with my team using FlowDo?",
    answer: "Yes! FlowDo supports team workspaces where you can share projects, assign tasks, and track collective progress. Team members can see shared Pomodoro sessions and collaborate on achieving common goals."
  },
  {
    question: "What kind of analytics and insights does FlowDo provide?",
    answer: "FlowDo offers comprehensive productivity analytics including task completion rates, time spent on different projects, Pomodoro session effectiveness, and productivity trends over time. These insights help you optimize your workflow."
  },
  {
    question: "Is my data secure with FlowDo?",
    answer: "Security is our top priority. We use enterprise-grade encryption, secure cloud storage, and follow industry best practices to protect your data. Your information is never shared with third parties without your explicit consent."
  },
  {
    question: "Can I import my existing tasks from other apps?",
    answer: "Yes! FlowDo supports importing tasks from popular productivity apps like Todoist, Asana, and Trello. We also provide CSV import options for custom data migration."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <HelpCircle className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Got questions? We&apos;ve got answers. Find everything you need to know about FlowDo.
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors duration-200"
                >
                  <span className="text-lg font-semibold text-foreground pr-8">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0",
                      openIndex === index && "transform rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-muted-foreground">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions? We&apos;re here to help!
          </p>
          <a
            href="mailto:support@flowdo.com"
            className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200"
          >
            Contact Support →
          </a>
        </motion.div>
      </div>
    </section>
  )
}