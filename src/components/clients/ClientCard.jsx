/* eslint-disable no-unused-vars */
import React from 'react';

import {
  FaEdit,
  FaEnvelope,
  FaInfoCircle,
  FaPhone,
  FaTrash,
} from 'react-icons/fa';

const ClientCard = ({ client, onEdit, onDelete, onMoreInfo }) => (
  <li className="grid grid-cols-[2fr_1.5fr_1fr_120px] gap-4 items-center w-full px-4 py-2 hover:bg-white/70 transition text-sm font-[CaviarDreams] text-[#5f4b5a] box-border">
    {/* Client Info */}
    <span className="flex items-center truncate">
      <span className="font-[Soligant]">{client.first_name} {client.last_name}</span>
    </span>
    <span className="flex items-center truncate">
      <FaEnvelope className="mr-2 text-[#c1a38f]" />
      <span className="truncate">{client.email}</span>
    </span>
    <span className="flex items-center truncate">
      <FaPhone className="mr-2 text-[#3e2e3d]" />
      <span className="truncate">{client.phone_number}</span>
    </span>

    {/* Action Buttons */}
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => onMoreInfo(client)}
        className="p-2 rounded-full bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition"
      >
        <FaInfoCircle className="w-4 h-4" />
      </button>
      <button
        onClick={() => onEdit(client)}
        className="p-2 rounded-full bg-[#c1a38f] text-white hover:bg-[#a78974] transition"
      >
        <FaEdit className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(client)}
        className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
      >
        <FaTrash className="w-4 h-4" />
      </button>
    </div>
  </li>
);

export default ClientCard;
