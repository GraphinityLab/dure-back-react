import React from 'react';

import {
  FaClock,
  FaDollarSign,
  FaEdit,
  FaInfoCircle,
  FaTags,
  FaTrash,
} from 'react-icons/fa';

const ServiceCard = ({ service, onEdit, onDelete, onMoreInfo }) => (
  <li className="grid grid-cols-[2fr_1.5fr_1fr_1fr_120px] gap-4 items-center w-full px-4 py-2 hover:bg-white/70 transition text-sm font-[CaviarDreams] text-[#5f4b5a] box-border">

    {/* Service Info */}
    <span className="flex items-center truncate">
      <FaTags className="mr-2 text-[#c1a38f]" />
      <span className="truncate">{service.name}</span>
    </span>
    <span className="flex items-center truncate">
      <FaTags className="mr-2 text-[#a78974]" />
      <span className="truncate">{service.category || "N/A"}</span>
    </span>
    <span className="flex items-center truncate">
      <FaClock className="mr-2 text-[#3e2e3d]" />
      <span className="truncate">{service.duration_minutes} mins</span>
    </span>
    <span className="flex items-center truncate">
      <FaDollarSign className="mr-2 text-green-600" />
      <span className="truncate">${Number(service.price).toFixed(2)}</span>
    </span>

    {/* Action Buttons */}
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => onMoreInfo(service)}
        className="p-2 rounded-full bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition"
      >
        <FaInfoCircle className="w-4 h-4" />
      </button>
      <button
        onClick={() => onEdit(service)}
        className="p-2 rounded-full bg-[#c1a38f] text-white hover:bg-[#a78974] transition"
      >
        <FaEdit className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(service.id)}
        className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
      >
        <FaTrash className="w-4 h-4" />
      </button>
    </div>
  </li>
);

export default ServiceCard;
