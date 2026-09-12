import { forwardRef } from 'react'
import { getPublicImageUrl } from '../services/storageService'

function formatAmount(num) {
  return Number(num).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function niceDate() {
  return new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

// forwardRef so the Cart page can point html2canvas at exactly this DOM node when
// exporting a PNG, the same way the Pricing Studio renders its receipt off-screen.
const OrderSummaryCard = forwardRef(function OrderSummaryCard(
  { settings, items, subtotal, customerName },
  ref
) {
  const logoUrl = getPublicImageUrl(settings?.logo_path)

  return (
    <div
      ref={ref}
      className="mx-auto w-full max-w-sm rounded-stitch border border-ink/5 bg-surface p-6 shadow-gentle"
    >
      <div className="flex flex-col items-center text-center">
        {logoUrl ? (
          <img src={logoUrl} alt={settings?.business_name} className="mb-2 h-12 w-12 rounded-full object-cover" />
        ) : (
          <span className="mb-2 text-3xl" aria-hidden="true">🧶</span>
        )}
        <div className="font-heading text-lg font-semibold text-ink">
          {settings?.business_name || 'AXKN07 Crochet'}
        </div>
        {settings?.tagline && <div className="font-body text-xs text-ink-soft">{settings.tagline}</div>}
      </div>

      <div className="stitch-divider my-4" />

      <div className="flex justify-between font-body text-xs text-ink-soft">
        <span>Order request</span>
        <span>{niceDate()}</span>
      </div>
      {customerName && (
        <div className="mt-1 font-body text-xs text-ink-soft">
          Customer: <span className="font-semibold text-ink">{customerName}</span>
        </div>
      )}

      <div className="stitch-divider my-4" />

      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <div key={it.key} className="flex items-start justify-between gap-3 font-body text-sm">
            <span className="text-ink">
              {it.name}
              {it.color ? ` (${it.color})` : ''} <span className="text-ink-soft">×{it.qty}</span>
            </span>
            <span className="whitespace-nowrap font-semibold text-ink">₱{formatAmount(it.qty * it.price)}</span>
          </div>
        ))}
      </div>

      <div className="stitch-divider my-4" />

      <div className="flex justify-between font-heading text-lg font-semibold text-peach">
        <span>Total</span>
        <span>₱{formatAmount(subtotal)}</span>
      </div>

      <div className="mt-4 text-center font-body text-[11px] text-ink-soft">
        Generated from {settings?.business_name || 'AXKN07 Crochet'}'s Price List
      </div>
    </div>
  )
})

export default OrderSummaryCard
