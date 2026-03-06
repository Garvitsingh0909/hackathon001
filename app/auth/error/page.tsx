import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Authentication Error</CardTitle>
          <CardDescription>Something went wrong during authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams.message && (
            <p className="text-sm text-slate-600 bg-red-50 border border-red-200 rounded p-3">
              {searchParams.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/auth/login">Try Again</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
