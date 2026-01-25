import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function About() {
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
          <h1 className="text-4xl font-heading font-bold text-gray-900 border-b pb-4">О нас</h1>
          <div className="prose prose-blue max-w-none">
            <p className="text-lg leading-relaxed text-muted-foreground">
              DRUZHBA — это ваш надежный партнер в мире оптовых поставок обуви из ЭВА. Мы находимся в самом сердце торговой жизни Киргизии — на рынке "Дордой".
            </p>
            <h3 className="text-2xl font-bold mt-8 mb-4">Наши преимущества:</h3>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground">
              <li>Прямые поставки и лучшие оптовые цены.</li>
              <li>Высокое качество материала ЭВА (легкость, прочность, гигиеничность).</li>
              <li>Широкий ассортимент моделей для взрослых и детей.</li>
              <li>Индивидуальный подход к каждому оптовому клиенту.</li>
            </ul>

            <div className="mt-12 grid sm:grid-cols-2 gap-6">
              <div className="p-6 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
                <h4 className="font-bold text-lg mb-4">Где нас найти:</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Мы всегда рады видеть вас лично! Наш павильон расположен по адресу:<br />
                  <strong className="text-foreground">Рынок "Дордой", Оберон Форт, 30 проход, 2 контейнер</strong>
                </p>
              </div>
              <div className="p-6 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
                <h4 className="font-bold text-lg mb-4">График работы:</h4>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Пн – Чт:</span>
                    <span className="font-medium text-foreground">08:00 – 17:00</span>
                  </div>
                  <div className="flex justify-between text-red-500 font-semibold">
                    <span>Пятница:</span>
                    <span>Выходной</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Сб – Вс:</span>
                    <span className="font-medium text-foreground">08:00 – 17:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
