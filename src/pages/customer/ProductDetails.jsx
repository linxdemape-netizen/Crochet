import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProductById } from '../../services/productService'
import { getPublicImageUrl } from '../../services/storageService'
import { AvailabilityBadge, FeatureBadge } from '../../components/Badge'
import AddToCartButton from '../../components/AddToCartButton'
import { Spinner } from '../../components/LoadingStates'
import { ErrorState } from '../../components/EmptyState'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [qty, setQty] = useState(1)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProductById(id)
      if (!data) {
        setError('This product could not be found.')
      } else {
        setProduct(data)
        const colors = Array.isArray(data.colors) ? data.colors : []
        setSelectedColor(colors[0] || null)
      }
    } catch (err) {
      console.error(err)
      setError('We couldn\u2019t load this product right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <Spinner label="Loading product…" />

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <ErrorState message={error} onRetry={load} />
        <div className="mt-6 text-center">
          <Link to="/prices" className="btn-secondary">
            Back to Price List
          </Link>
        </div>
      </div>
    )
  }

  const imageUrl = getPublicImageUrl(product.image_path)
  const colors = Array.isArray(product.colors) ? product.colors : []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/prices" className="mb-6 inline-flex items-center gap-1 font-body text-sm font-semibold text-ink-soft hover:text-ink">
        ← Back to Price List
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-stitch bg-daisy/40 shadow-gentle">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">🧶</div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {product.is_new && <FeatureBadge tone="olive">New</FeatureBadge>}
            {product.featured && <FeatureBadge tone="peach">Featured</FeatureBadge>}
            {product.categories?.name && (
              <span className="rounded-full bg-daisy/50 px-2.5 py-1 font-body text-xs text-ink-soft">
                {product.categories.name}
              </span>
            )}
          </div>

          <h1 className="font-heading text-3xl font-semibold text-ink">{product.name}</h1>
          <span className="font-heading text-3xl font-semibold text-peach">₱{formatPrice(product.price)}</span>
          <AvailabilityBadge status={product.availability} />

          {product.short_description && (
            <p className="font-body text-base text-ink-soft">{product.short_description}</p>
          )}

          {product.description && (
            <p className="font-body text-sm leading-relaxed text-ink-soft">{product.description}</p>
          )}

          <dl className="grid grid-cols-2 gap-4 rounded-cozy bg-surface-soft p-4">
            {colors.length > 0 && (
              <div className="col-span-2">
                <dt className="font-body text-xs font-semibold uppercase tracking-wide text-ink-soft">Color</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full px-3 py-1 font-body text-xs shadow-gentle transition-colors ${
                        selectedColor === color ? 'bg-peach text-surface' : 'bg-surface text-ink hover:bg-daisy/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </dd>
              </div>
            )}
            {product.size && (
              <div>
                <dt className="font-body text-xs font-semibold uppercase tracking-wide text-ink-soft">Size</dt>
                <dd className="mt-1 font-body text-sm text-ink">{product.size}</dd>
              </div>
            )}
          </dl>

          {product.note && (
            <p className="rounded-cozy border border-peach/20 bg-blush/10 p-4 font-body text-sm text-ink-soft">
              {product.note}
            </p>
          )}

          {product.availability !== 'Sold Out' ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-full border-2 border-peach/30 px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="font-heading text-lg text-ink-soft hover:text-ink"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="font-body font-semibold text-ink">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="font-heading text-lg text-ink-soft hover:text-ink"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <AddToCartButton product={product} qty={qty} color={selectedColor} className="flex-1" />
            </div>
          ) : (
            <span className="font-body text-sm font-semibold text-ink-soft">Currently sold out</span>
          )}
        </div>
      </div>
    </div>
  )
}

function formatPrice(price) {
  const num = Number(price)
  if (Number.isNaN(num)) return price
  return num.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
