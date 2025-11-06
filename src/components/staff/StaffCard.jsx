/* eslint-disable no-unused-vars */
import React from 'react';

import {
  FaEdit,
  FaInfoCircle,
  FaTrash,
} from 'react-icons/fa';

const StaffCard = ({ staff, onEdit, onDelete, onMoreInfo }) => {
  if (!staff) return null; // safety check

  return (
    <li className="grid grid-cols-[2fr_1.5fr_1fr_120px] gap-4 items-center w-full px-4 py-2 hover:bg-white/70 transition text-sm font-[CaviarDreams] text-[#5f4b5a] box-border">
      {/* Staff Info */}
      <span className="flex items-center truncate">
        <span className="font-[Soligant]">
          {staff.first_name || ""} {staff.last_name || ""}
        </span>
      </span>
      <span className="flex items-center truncate">{staff.username || ""}</span>
      <span className="flex items-center truncate">{staff.email || ""}</span>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => onMoreInfo(staff)}
          className="p-2 rounded-full bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition"
        >
          <FaInfoCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(staff)}
          className="p-2 rounded-full bg-[#c1a38f] text-white hover:bg-[#a78974] transition"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(staff)}
          className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
};

export default StaffCard;
