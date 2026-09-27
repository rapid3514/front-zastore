import { Check, Heart } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

export function OrderSuccessPage() {
  const { id = '' } = useParams()

  return <main className="shop-success-page">
    <div className="shop-success-glow" aria-hidden="true" />
    <div className="shop-success-check"><Check size={58} strokeWidth={2.2} /></div>
    <div className="text-center">
      <h1>Buyurtma muvaffaqiyatli yuborildi! <Heart className="inline size-5" /></h1>
      <div className="shop-order-number"><span>Buyurtma raqami</span><strong>#{id.slice(0, 8)}</strong></div>
      <p>Tez orada siz bilan bog‘lanamiz.</p>
    </div>
    <Link to="/" className="shop-success-button">Asosiy sahifaga qaytish</Link>
  </main>
}
