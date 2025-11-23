'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, ChevronDown, FileText, Loader2 } from 'lucide-react'
import { saveWaiverSignature } from '@/server/actions/waiver'
import { useToast } from '@/hooks/use-toast'

interface WaiverPageClientProps {
  userId: string
  redirectTo: string
}

export function WaiverPageClient({ userId, redirectTo }: WaiverPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // Allow some tolerance (e.g., 20px)
    if (scrollHeight - scrollTop - clientHeight < 20) {
      setHasScrolledToBottom(true)
    }
  }

  const handleSign = async () => {
    if (!name || !address || !isAgreed || isSubmitting) return

    setIsSubmitting(true)

    try {
      const result = await saveWaiverSignature(userId, { name, address })

      if (result.success) {
        toast({
          title: 'Waiver Signed',
          description: 'Your waiver has been successfully recorded.',
        })
        
        // Redirect to the intended destination
        router.push(redirectTo)
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save waiver signature',
          variant: 'destructive',
        })
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error signing waiver:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4 mx-auto">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white font-heading tracking-tight">
            Release of Liability & Waiver
          </h1>
          <p className="text-center text-zinc-400 text-base max-w-md mx-auto mt-2">
            Please read carefully. By signing this document, you waive certain legal rights, including the right to sue.
          </p>
        </div>

        {/* Scrollable Content */}
        <div
          className="max-h-[50vh] overflow-y-auto p-6 bg-zinc-950 relative group"
          onScroll={handleScroll}
          ref={scrollRef}
        >
          <div className="prose prose-invert prose-sm max-w-none text-zinc-300 space-y-6">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm leading-relaxed">
              <p className="mb-4">
                In consideration of <strong className="text-white">1000417123 Ontario Inc. (Batts Athletics Burlington)</strong> (the &quot;Company&quot;) permitting the individual named below (&quot;I&quot; or &quot;me&quot;) to participate in activities at Company&apos;s facilities (the &quot;Activities&quot;), and for other good and valuable consideration, I agree to all the terms and conditions set forth in this agreement (this &quot;Agreement&quot;).
              </p>

              <h4 className="text-white font-bold text-base mt-6 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Assumption of Risks
              </h4>
              <p className="mb-4">
                I AM AWARE AND UNDERSTAND THAT THE ACTIVITIES INVOLVE MANY RISKS, DANGERS, AND HAZARDS, INCLUDING BUT NOT LIMITED TO THE RISK OF SERIOUS INJURY, DEATH, OR PROPERTY DAMAGE. I ACKNOWLEDGE THAT I AM VOLUNTARILY PARTICIPATING IN THE ACTIVITIES. I FREELY ACCEPT AND FULLY ASSUME ANY AND ALL OF THE RISKS, DANGERS, AND HAZARDS INVOLVED AND THE POSSIBILITY OF INJURY, DEATH, OR PROPERTY DAMAGE, WHETHER CAUSED BY THE NEGLIGENCE OF THE COMPANY OR OTHERWISE.
              </p>

              <h4 className="text-white font-bold text-base mt-6 mb-2">Waiver & Release</h4>
              <p className="mb-4">
                I hereby expressly waive and release any and all claims which I have or may in the future have against the Company, its affiliates, and their respective directors, officers, employees, contractors, agents, representatives, shareholders, successors, and assigns (collectively, &quot;Releasees&quot;), arising out of or attributable to the Activities, due to any cause whatever, including without limitation the negligence of the Company or any other Releasee, breach of contract, or breach of any statutory or other duty of care owing under occupiers liability legislation or otherwise. I covenant not to make or bring any such claim against the Company or any other Releasee, and forever release and discharge the Company and all other Releasees from liability under such claims.
              </p>

              <h4 className="text-white font-bold text-base mt-6 mb-2">Indemnification</h4>
              <p className="mb-4">
                I SHALL DEFEND, INDEMNIFY AND HOLD HARMLESS THE COMPANY AND ALL OTHER RELEASEES AGAINST ANY AND ALL LOSSES, DAMAGES, LIABILITIES, DEFICIENCIES, CLAIMS, ACTIONS, JUDGMENTS, SETTLEMENTS, INTEREST, AWARDS, PENALTIES, FINES, COSTS, OR EXPENSES OF WHATEVER KIND, INCLUDING REASONABLE LEGAL FEES, IN CONNECTION WITH ANY THIRD-PARTY CLAIM, SUIT, ACTION, OR PROCEEDING ARISING OUT OF OR RESULTING FROM THE ACTIVITIES.
              </p>

              <p className="mt-6 text-xs text-zinc-500 italic">
                This Agreement shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein.
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-red-200 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
              <p>
                I ACKNOWLEDGE THAT I HAVE READ AND UNDERSTOOD ALL OF THE TERMS OF THIS AGREEMENT AND THAT I AM VOLUNTARILY WAIVING SUBSTANTIAL LEGAL RIGHTS.
              </p>
            </div>
          </div>

          {/* Scroll Indicator */}
          {!hasScrolledToBottom && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce bg-zinc-800/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg border border-zinc-700 flex items-center gap-2 pointer-events-none">
              Scroll to read more <ChevronDown className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Footer / Form */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Full Name (Signature)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="name"
                  placeholder="Type your full legal name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-[#50C878] focus:ring-[#50C878]/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Current Address</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                </div>
                <Input
                  id="address"
                  placeholder="123 Main St, City, Province"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-[#50C878] focus:ring-[#50C878]/20"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800 transition-colors hover:border-zinc-700">
            <div className="flex items-center h-5 mt-0.5">
              <input
                type="checkbox"
                id="agree"
                className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-[#50C878] focus:ring-[#50C878] focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                disabled={!hasScrolledToBottom || isSubmitting}
              />
            </div>
            <div className="flex-1">
              <Label
                htmlFor="agree"
                className={cn(
                  "text-sm font-medium leading-none cursor-pointer block",
                  !hasScrolledToBottom ? "text-zinc-500" : "text-zinc-200"
                )}
              >
                I have read and agree to the terms above
              </Label>
              {!hasScrolledToBottom && (
                <p className="text-xs text-amber-500/80 mt-1.5 font-medium">
                  Please scroll to the bottom of the document to enable this checkbox.
                </p>
              )}
            </div>
          </div>

          <Button
            className={cn(
              "w-full h-12 text-base font-semibold rounded-xl transition-all duration-300",
              isAgreed && name && address && !isSubmitting
                ? "bg-[#50C878] hover:bg-[#3DA860] text-white shadow-lg shadow-[#50C878]/20 hover:scale-[1.01]"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed hover:bg-zinc-800"
            )}
            disabled={!isAgreed || !name || !address || isSubmitting}
            onClick={handleSign}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing...
              </span>
            ) : isAgreed && name && address ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Sign & Accept Waiver
              </span>
            ) : (
              "Complete All Fields to Sign"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

