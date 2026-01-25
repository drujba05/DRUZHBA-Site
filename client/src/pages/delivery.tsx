import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Delivery() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4 group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Вернуться на главную
          </Link>
          <h1 className="text-4xl font-heading font-bold text-gray-900 border-b pb-4">Доставка и оплата</h1>
          <div className="grid gap-8">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-2xl font-bold mb-4 text-primary">Способы оплаты</h3>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Мы предлагаем два удобных способа оплаты заказа:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <h4 className="font-bold mb-2">Наличный расчет</h4>
                    <p className="text-sm text-muted-foreground">Оплата наличными при получении товара на рынке "Дордой" или через представителя.</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <h4 className="font-bold mb-2">Мобильный перевод</h4>
                    <p className="text-sm text-muted-foreground">Перевод на карту (МБанк, О!Деньги, Элсом). Реквизиты будут предоставлены после подтверждения заказа менеджером.</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Отправка товара осуществляется только после <strong>полной 100% оплаты</strong> заказа.
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-2xl font-bold mb-4 text-primary">Доставка</h3>
              <p className="text-muted-foreground mb-4">
                Мы доставляем товар любым удобным для вас способом:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Транспортные компании (по выбору клиента).</li>
                <li>Курьерские службы.</li>
                <li>Передача через вашего представителя или доверенное лицо на рынке "Дордой".</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
