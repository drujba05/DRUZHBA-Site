import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Returns() {
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
          <h1 className="text-4xl font-heading font-bold text-gray-900 border-b pb-4">Возврат товара</h1>
          <div className="prose prose-blue max-w-none space-y-6">
            <p className="text-lg text-muted-foreground">
              Мы стремимся к долгосрочному сотрудничеству и ценим качество нашего товара.
            </p>
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
              <h3 className="text-xl font-bold mb-2 text-yellow-800">Обратите внимание:</h3>
              <p className="text-yellow-700">
                Возврат товара возможен только при обнаружении производственного брака. Претензии по качеству принимаются в течение 3-х рабочих дней с момента получения товара.
              </p>
            </div>
            <p className="text-muted-foreground">
              Для оформления возврата, пожалуйста, свяжитесь с нами через Telegram или WhatsApp, приложив фото/видео подтверждение дефекта.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
