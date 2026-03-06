import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-green-600">Account Created</CardTitle>
          <CardDescription>Please check your email to verify your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            We've sent a verification email to your inbox. Click the link in the email to activate your account and get started.
          </p>
          <p className="text-xs text-slate-500">
            If you don't see the email, check your spam folder.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
