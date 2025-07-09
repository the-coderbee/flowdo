"use client"

import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  "Free 14-day trial",
  "No credit card required", 
  "Cancel anytime",
  "Full feature access"
]

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-teal-50 via-cyan-50 to-slate-50 dark:from-teal-950/20 dark:via-gray-950/20 dark:to-slate-950/20 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="border-0 bg-background/60 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center space-y-8">
                {/* Icon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="inline-flex p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>

                {/* Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                    Ready to Transform Your{" "}
                    <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
                      Productivity?
                    </span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Join thousands of professionals who have already discovered the power of focused work. 
                    Start your free trial today and experience the FlowDo difference.
                  </p>
                </motion.div>

                {/* Features list */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex flex-wrap justify-center gap-4 lg:gap-8"
                >
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                >
                  <Button 
                    size="lg" 
                    className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-800 hover:to-teal-600 group transition-all duration-300"
                  >
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-8 py-4 text-lg font-semibold border-2 hover:bg-muted/50"
                  >
                    Schedule a Demo
                  </Button>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="pt-8 border-t border-border/50"
                >
                  <p className="text-xs text-muted-foreground mb-4">
                    Trusted by teams at leading companies worldwide
                  </p>
                  <div className="flex items-center justify-center space-x-8 opacity-60">
                    {["Google", "Microsoft", "Slack", "Notion", "Linear"].map((company, index) => (
                      <div key={index} className="text-sm font-medium text-muted-foreground">
                        {company}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Security note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-xs text-muted-foreground space-y-1"
                >
                  <p>🔒 Your data is encrypted and secure</p>
                  <p>⚡ Setup takes less than 2 minutes</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}