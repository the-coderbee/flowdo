"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "register"
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleSuccess = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
            <TabsTrigger value="login" className="rounded-none">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-none">
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            <TabsContent value="login" className="mt-0">
              <LoginForm onSuccess={handleSuccess} />
            </TabsContent>
            
            <TabsContent value="register" className="mt-0">
              <RegisterForm onSuccess={handleSuccess} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}