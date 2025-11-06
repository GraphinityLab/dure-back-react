import React from 'react';

import {
  FaCalendarAlt,
  FaClock,
  FaFileAlt,
  FaTag,
  FaTrash,
  FaUser,
} from 'react-icons/fa';

import { formatDate } from './utils';

const AppointmentCard = ({ appointment, onEdit, onInfo, onDelete }) => (
  // AppointmentCard.jsx
  <li className="flex flex-col sm:flex-row sm:items-center justify-between w-full min-w-0 px-4 py-3 hover:bg-white/70 transition text-sm font-[CaviarDreams] text-[#5f4b5a] box-border">
    <div className="flex flex-wrap gap-x-4 gap-y-1 items-center min-w-0">
      <span className="flex items-center truncate min-w-0">
        <FaUser className="mr-2" /> {appointment.clientName}
      </span>
      <span className="flex items-center truncate min-w-0">
        <FaTag className="mr-2" /> {appointment.serviceName}
      </span>
      <span className="flex items-center truncate min-w-0">
        <FaCalendarAlt className="mr-2" />{" "}
        {formatDate(appointment.appointment_date)}
      </span>
      <span className="flex items-center truncate min-w-0">
        <FaClock className="mr-2" /> {appointment.startTime} -{" "}
        {appointment.endTime}
      </span>
    </div>

    <div className="flex items-center space-x-2 mt-2 sm:mt-0 shrink-0">
      <span
        className={`text-xs font-[CaviarDreams] px-2 py-0.5 rounded-full uppercase ${
          appointment.status === "confirmed"
            ? "bg-green-200 text-green-800"
            : appointment.status === "declined"
            ? "bg-red-200 text-red-800"
            : "bg-yellow-200 text-yellow-800"
        }`}
      >
        {appointment.status}
      </span>
      <button
        onClick={() => onInfo(appointment)}
        className="p-2 rounded-full text-xs bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition"
      >
        <FaFileAlt />
      </button>
      <button
        onClick={() => onEdit(appointment)}
        className="p-2 rounded-full text-xs bg-[#c1a38f] text-white hover:bg-[#a78974] transition"
      >
        <FaCalendarAlt />
      </button>
      <button
        onClick={() => onDelete(appointment.id)}
        className="p-2 rounded-full text-xs bg-red-100 text-red-700 hover:bg-red-200 transition"
      >
        <FaTrash />
      </button>
    </div>
  </li>
);

export default AppointmentCard;
