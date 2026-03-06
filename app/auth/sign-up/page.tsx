import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SignUpPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const handleSignUp = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      redirect('/auth/error?message=' + encodeURIComponent('Passwords do not match'))
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          email,
        },
      },
    })

    if (error) {
      redirect('/auth/error?message=' + encodeURIComponent(error.message))
    }

    redirect('/auth/sign-up-success')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Sign up to get started with our platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
          <p className="text-sm text-center mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
