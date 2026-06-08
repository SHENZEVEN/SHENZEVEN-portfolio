import { motion } from 'framer-motion';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/projects';

export default function Projects({ onNavigate }) {
  return (
    <div className="min-h-screen bg-cyber-black pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-orbitron text-4xl font-bold mb-4 text-cyber-blue">
            项目总览
          </h1>
          <p className="text-cyber-gray font-noto">记录我的技术成长轨迹</p>
        </motion.div>

        <div className="space-y-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <ProjectCard
                project={project}
                onClick={() => onNavigate(`/project/${project.id}`)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
