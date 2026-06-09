import { motion } from 'framer-motion';
import { Mail, Code2, Download, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-cyber-black pt-16 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h1 className="font-orbitron text-4xl font-bold mb-4 text-cyber-blue">
            与我联系
          </h1>

          <p className="text-cyber-white font-noto text-lg">
            我正在寻找第一份实习机会
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-cyber-gray font-noto">
              <MessageCircle size={24} />
              <span>SHENZEVEN_orb</span>
            </div>

            <div className="flex items-center justify-center gap-3 text-cyber-gray font-noto">
              <Mail size={24} />
              <span>shenzeven@qq.com</span>
            </div>

            <motion.a
              href="https://github.com/SHENZEVEN"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 text-cyber-gray hover:text-cyber-blue font-noto transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <Code2 size={24} />
              <span>github.com/SHENZEVEN</span>
            </motion.a>
          </div>

          <motion.a
            href="/resume.pdf"
            download
            className="flex items-center justify-center gap-2 bg-cyber-blue text-cyber-black font-noto text-sm font-medium px-8 py-3 rounded-lg mx-auto transition-all hover:opacity-90 inline-flex"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download size={16} />
            下载简历
          </motion.a>

        </motion.div>
      </div>
    </div>
  );
}
