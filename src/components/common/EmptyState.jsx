import React from 'react';
import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ 
  title = "No Data Found", 
  description = "There are no items to display at the moment.", 
  icon: Icon = PackageOpen,
  action
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="p-4 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 mb-4 shadow-sm">
        <Icon className="h-8 w-8 text-[#6b5c55]/70" />
      </div>
      <h3 className="text-lg font-semibold text-[#3c2b21] mb-2">{title}</h3>
      <p className="text-sm text-[#6b5c55] max-w-xs mb-6">{description}</p>
      
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
