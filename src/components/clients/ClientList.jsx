/* eslint-disable no-unused-vars */
import React from 'react';

import ClientCard from './ClientCard';

const ClientList = ({ clients, onEdit, onDelete, onMoreInfo }) => {
  if (!clients || clients.length === 0) {
    return (
      <div className="p-4 text-center text-[#5f4b5a] font-[CaviarDreams]">
        No clients found.
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white/70 backdrop-blur-md rounded-xl shadow-inner p-0 h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#c1a38f]/80 scrollbar-track-[#f5eeee]/50">
      {/* Table Headers */}
      <div className="grid grid-cols-[2fr_1.5fr_1fr_120px] gap-4 px-4 py-2 font-[CaviarDreams] text-[#3e2e3d] bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <span>Client Name</span>
        <span>Email</span>
        <span>Phone</span>
        <span>Actions</span>
      </div>

      {/* Clients */}
      <ul className="flex flex-col gap-2">
        {clients.map((client) => (
          <ClientCard
            key={client.client_id}
            client={client}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoreInfo={onMoreInfo}
          />
        ))}
      </ul>
    </div>
  );
};

export default ClientList;
