export const projects = [
  {
    id: 1,
    number: '01',
    heroTags: ['独立全栈', '从0到1'],
    name: '舞房预约管理系统',
    description: '面向高校社团的舞房预约管理系统，解决人工预约混乱、时间冲突等问题',
    tags: ['React', 'Node.js', '微信小程序', '公众号模板消息', '云开发'],
    completedAt: '2026.05',
    highlights: '全栈开发 · 平台迁移 · 真实落地',
    overview: '面向高校社团的舞房预约管理系统，解决人工预约混乱、时间冲突等问题。从微信小程序起步，因平台限制迁移至Web+公众号方案。',
    features: ['用户预约', '管理员审核', '状态推送', '失败原因回显'],
    techHighlights: [
      '全栈开发：独立完成后端、前端、数据库设计',
      '平台迁移：因小程序备案及长期订阅限制，主动评估Web+公众号替代方案，完成架构调整与功能迁移',
      '业务逻辑：实现用户预约、管理员审核、状态推送、失败原因回显的完整流程',
      '真实落地：系统已投入社团内部使用'
    ],
    achievements: ['累计处理预约记录[X]条', '解决人工预约混乱、时间冲突、通知缺失等问题'],
    githubUrl: 'https://github.com/SHENZEVEN'
  },
  {
    id: 2,
    number: '02',
    heroTags: ['AI驱动', '多模态解析'],
    name: 'AI面试模拟器',
    description: 'AI驱动的全栈面试练习平台，覆盖从通用刷题到简历模拟的完整备考链路',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'DeepSeek API', 'Vercel'],
    completedAt: '2026.06',
    highlights: '多模态解析 · Prompt工程 · 全流程闭环',
    overview: 'AI驱动的全栈面试练习平台，覆盖从通用刷题到简历模拟的完整备考链路。支持多模态简历解析与AI深度追问。',
    features: ['快速练习', '针对性练习', '题库管理', '简历拷打', '历史记录与错题本'],
    techHighlights: [
      '多模态解析：通过pdf-parse、mammoth、tesseract.js实现PDF/Word/图片的文本解析',
      'Prompt工程：设计结构化输出规则，使AI返回稳定的JSON评价数据（评分+优缺点+参考答案）',
      '简历拷打机制：针对简历内容自动生成5道递进式面试题，覆盖技术深度、架构设计、项目经验等维度',
      '工程化实践：组件化开发+自定义Hooks+路由管理，题库与用户数据基于localStorage实现前端持久化',
      '全流程闭环：从题目生成、AI评价、错题记录到报告导出'
    ],
    achievements: ['支持多格式简历上传（PDF/Word/图片）', '低成本方案实现多格式文件处理'],
    githubUrl: 'https://github.com/SHENZEVEN'
  }
];
