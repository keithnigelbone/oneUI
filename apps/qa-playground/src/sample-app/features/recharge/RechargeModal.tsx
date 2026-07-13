import { useEffect, useState } from 'react'
import {
  Button,
  CircularProgressIndicator,
  Container,
  InputField,
  Modal,
  Text,
} from '@/debug/oneui'
import type { Plan } from '@/sample-app/services/types'
import { useAppStore } from '@/sample-app/store/appStore'
import { useAnnouncer } from '../../accessibility/announcer'
import { formatINR, isValidMobile } from '../../utils/format'
import { TESTIDS } from '@/sample-app/testids'

interface RechargeModalProps {
  plan: Plan | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RechargeModal({ plan, open, onOpenChange }: RechargeModalProps) {
  const storedPhone = useAppStore((s) => s.profilePhone)
  const setLastRecharge = useAppStore((s) => s.setLastRecharge)
  const announce = useAnnouncer((s) => s.announce)

  const [mobile, setMobile] = useState('')
  const [touched, setTouched] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      setMobile(storedPhone.replace(/\D/g, '').slice(-10))
      setTouched(false)
      setProcessing(false)
      setSuccess(false)
    }
  }, [open, storedPhone])

  const valid = isValidMobile(mobile)
  const error = touched && !valid ? 'Enter a valid 10-digit mobile number' : undefined

  const confirm = async () => {
    setTouched(true)
    if (!valid || !plan) return
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 700))
    setLastRecharge(plan.id, mobile)
    setProcessing(false)
    setSuccess(true)
    announce(`Recharge successful. ${plan.name} plan of ${formatINR(plan.price)} activated.`)
  }

  if (!plan) return null

  return (
    <>
      <Modal
        open={open && !success}
        onOpenChange={onOpenChange}
        title="Confirm recharge"
        description="Enter the mobile number to recharge."
        dismissible
        footerEnd={
          <>
            <Button attention="low" onPress={() => onOpenChange(false)} data-testid={TESTIDS.recharge.cancelBtn}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              attention="high"
              loading={processing}
              onPress={confirm}
              data-testid={TESTIDS.recharge.confirmBtn}
            >
              Pay {formatINR(plan.price)}
            </Button>
          </>
        }
        data-testid={TESTIDS.recharge.modal}
      >
        <Container surface="ghost" layout="flex" direction="column" gap="4">
          <InputField
            label="Mobile number"
            value={mobile}
            onChange={(v: string) => setMobile(v.replace(/\D/g, '').slice(0, 10))}
            onBlur={() => setTouched(true)}
            placeholder="10-digit Jio number"
            error={error}
            type="tel"
            fullWidth
            data-testid={TESTIDS.recharge.mobileInput}
          />

          <Container
            surface="subtle"
            layout="flex"
            direction="column"
            gap="2"
            padding="3"
            width="full"
            data-testid={TESTIDS.recharge.planSummary}
          >
            <Container surface="ghost" layout="flex" direction="row" justify="space-between" align="center">
              <Text variant="title" size="S" weight="high">{plan.name}</Text>
              <Text variant="title" size="S" weight="high">{formatINR(plan.price)}</Text>
            </Container>
            <Text variant="body" size="S" attention="medium">
              {plan.dataPerDay} GB/day · {plan.calls} calls · {plan.validityDays} days validity
            </Text>
          </Container>

          {processing && (
            <Container surface="ghost" layout="flex" direction="row" align="center" gap="2">
              <CircularProgressIndicator size="S" aria-label="Processing payment" />
              <Text variant="body" size="S" attention="medium">Processing payment…</Text>
            </Container>
          )}
        </Container>
      </Modal>

      <Modal
        open={open && success}
        onOpenChange={onOpenChange}
        title="Recharge successful"
        description={`${plan.name} is now active.`}
        dismissible
        footerEnd={
          <Button
            appearance="primary"
            attention="high"
            onPress={() => onOpenChange(false)}
            data-testid={TESTIDS.recharge.successClose}
          >
            Done
          </Button>
        }
        data-testid={TESTIDS.recharge.successDialog}
      >
        <Container surface="ghost" layout="flex" direction="column" gap="2">
          <Text variant="body" size="M">
            {formatINR(plan.price)} recharge for <strong>{mobile}</strong> completed.
          </Text>
          <Text variant="body" size="S" attention="medium">
            A confirmation has been sent to your registered email.
          </Text>
        </Container>
      </Modal>
    </>
  )
}
