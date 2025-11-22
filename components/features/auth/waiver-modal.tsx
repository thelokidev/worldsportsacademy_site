'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface WaiverModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSigned: (signature: { name: string; address: string; date: string }) => void
}

export function WaiverModal({ isOpen, onOpenChange, onSigned }: WaiverModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // Allow some tolerance (e.g., 10px)
    if (scrollHeight - scrollTop - clientHeight < 20) {
      setHasScrolledToBottom(true)
    }
  }

  const handleSign = () => {
    if (name && address && isAgreed) {
      onSigned({ name, address, date: new Date().toISOString() })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-red-600">
            RELEASE OF LIABILITY, WAIVER OF CLAIMS, AND ASSUMPTION OF RISKS
          </DialogTitle>
          <DialogDescription className="text-center font-semibold text-black">
            BY SIGNING THIS DOCUMENT, YOU WILL WAIVE CERTAIN LEGAL RIGHTS, INCLUDING THE RIGHT TO SUE OR CLAIM COMPENSATION. PLEASE READ CAREFULLY.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto p-4 border rounded-md bg-gray-50 text-sm space-y-4"
          onScroll={handleScroll}
        >
          <p>
            In consideration of <strong>1000417123 Ontario Inc. (Batts Athletics Burlington)</strong> (the "Company") permitting the individual named below ("I" or "me") to participate in activities at Company's facilities (the "Activities"), and for other good and valuable consideration, I agree to all the terms and conditions set forth in this agreement (this "Agreement").
          </p>

          <h4 className="font-bold underline">ASSUMPTION OF RISKS</h4>
          <p>
            I AM AWARE AND UNDERSTAND THAT THE ACTIVITIES INVOLVE MANY RISKS, DANGERS, AND HAZARDS, INCLUDING BUT NOT LIMITED TO THE RISK OF SERIOUS INJURY, DEATH, OR PROPERTY DAMAGE. I ACKNOWLEDGE THAT I AM VOLUNTARILY PARTICIPATING IN THE ACTIVITIES. I FREELY ACCEPT AND FULLY ASSUME ANY AND ALL OF THE RISKS, DANGERS, AND HAZARDS INVOLVED AND THE POSSIBILITY OF INJURY, DEATH, OR PROPERTY DAMAGE, WHETHER CAUSED BY THE NEGLIGENCE OF THE COMPANY OR OTHERWISE.
          </p>

          <p>
            I hereby expressly waive and release any and all claims which I have or may in the future have against the Company, its affiliates, and their respective directors, officers, employees, contractors, agents, representatives, shareholders, successors, and assigns (collectively, "Releasees"), arising out of or attributable to the Activities, due to any cause whatever, including without limitation the negligence of the Company or any other Releasee, breach of contract, or breach of any statutory or other duty of care owing under occupiers liability legislation or otherwise. I covenant not to make or bring any such claim against the Company or any other Releasee, and forever release and discharge the Company and all other Releasees from liability under such claims.
          </p>

          <p>
            I SHALL DEFEND, INDEMNIFY AND HOLD HARMLESS THE COMPANY AND ALL OTHER RELEASEES AGAINST ANY AND ALL LOSSES, DAMAGES, LIABILITIES, DEFICIENCIES, CLAIMS, ACTIONS, JUDGMENTS, SETTLEMENTS, INTEREST, AWARDS, PENALTIES, FINES, COSTS, OR EXPENSES OF WHATEVER KIND, INCLUDING REASONABLE LEGAL FEES, IN CONNECTION WITH ANY THIRD-PARTY CLAIM, SUIT, ACTION, OR PROCEEDING ARISING OUT OF OR RESULTING FROM THE ACTIVITIES.
          </p>

          <p>
            This Agreement constitutes the entire agreement of the Company and me with respect to the subject matter contained herein and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, with respect to such subject matter.
          </p>

          <p>
            If any term or provision of this Agreement is held to be invalid, illegal, or unenforceable in any jurisdiction, such invalidity, illegality, or unenforceability shall not affect any other term or provision of this Agreement or invalidate or render unenforceable such term or provision in any other jurisdiction.
          </p>

          <p>
            This Agreement is binding on and shall ensure to the benefit of me and my heirs and next-of-kin, and the Company and its successors and assigns.
          </p>

          <p>
            This Agreement shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any claim or cause of action arising under this Agreement may be brought only in the courts of the Province of Ontario, in the City of Burlington, and I hereby consent to the exclusive jurisdiction of such courts.
          </p>

          <div className="font-bold border-t pt-4 mt-4">
            I ACKNOWLEDGE THAT I HAVE READ AND UNDERSTOOD ALL OF THE TERMS OF THIS AGREEMENT AND THAT I AM VOLUNTARILY WAIVING SUBSTANTIAL LEGAL RIGHTS (ON MY BEHALF AND ON BEHALF OF MY HEIRS, EXECUTORS, ADMINISTRATORS, AND NEXT-OF-KIN), INCLUDING THE RIGHT TO SUE THE COMPANY AND THE RELEASEES.
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Print Name (Signature)</Label>
              <Input
                id="name"
                placeholder="Type your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agree"
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              disabled={!hasScrolledToBottom}
            />
            <Label
              htmlFor="agree"
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                !hasScrolledToBottom && "text-gray-400"
              )}
            >
              I have read and agree to the terms above {!hasScrolledToBottom && "(Please scroll to the bottom to agree)"}
            </Label>
          </div>

          <Button
            className="w-full bg-[#50C878] hover:bg-[#3DA860] text-white"
            disabled={!isAgreed || !name || !address}
            onClick={handleSign}
          >
            Sign & Accept Waiver
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
