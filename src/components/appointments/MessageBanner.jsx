/* eslint-disable no-unused-vars */
import React from 'react';

import { motion } from 'framer-motion';

const MessageBanner = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`p-3 rounded-lg text-sm mb-6 text-center font-[CaviarDreams] font-semibold ${
      message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}
  >
    {message.text}
  </motion.div>
);

export default MessageBanner;
