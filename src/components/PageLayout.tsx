
import React, { ReactNode, Suspense } from "react";
import Layout from "./Layout";
import { motion } from "framer-motion";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  fullWidth?: boolean;
}

const PageSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="w-1/2 h-8 bg-accent/50 rounded animate-pulse"></div>
      <div className="w-5/6 h-4 bg-accent/30 rounded animate-pulse"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-accent/20 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
};

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title, 
  description,
  fullWidth = false 
}) => {
  return (
    <Layout>
      <div className={`px-4 py-6 ${fullWidth ? 'w-full' : 'max-w-6xl mx-auto'}`}>
        {(title || description) && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title && <h1 className="text-3xl font-bold mb-2">{title}</h1>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </motion.div>
        )}
        
        <Suspense fallback={<PageSkeleton />}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </Suspense>
      </div>
    </Layout>
  );
};

export default PageLayout;
