import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Users } from 'lucide-react';

import ClientCard from './ClientCard';

const ClientList = ({ clients, onEdit, onDelete, onMoreInfo }) => (
  <div className="w-full rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.15)] overflow-hidden">
    {/* Scrollable container with custom always-visible scrollbar */}
    <div className="max-h-[600px] overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-[#c1a38f]/60 scrollbar-thumb-rounded-full scrollbar-track-transparent hover:scrollbar-thumb-[#a78974]/80">
      <AnimatePresence mode="popLayout">
        {clients && clients.length > 0 ? (
          <ul className="w-full min-w-0 space-y-0">
            {clients.map((client, index) => (
              <ClientCard
                key={client.client_id}
                client={client}
                onEdit={onEdit}
                onDelete={onDelete}
                onMoreInfo={onMoreInfo}
                index={index}
              />
            ))}
          </ul>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 mb-4">
              <Users className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-[#3c2b21] mb-2">
              No Clients Found
            </h3>
            <p className="text-sm text-[#6b5c55] max-w-md">
              There are no clients matching your criteria. Try adjusting your search or filters.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

export default ClientList;
