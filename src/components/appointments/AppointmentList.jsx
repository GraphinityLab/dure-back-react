import React from 'react';

import AppointmentCard from './AppointmentCard';

const AppointmentList = ({ appointments, onEdit, onInfo, onDelete }) => (
  <div className="w-full border border-[#e8dcd4] rounded-xl bg-white/50 backdrop-blur-md shadow-sm overflow-hidden">
    {/* Scrollable container with custom always-visible scrollbar */}
    <div className="max-h-[500px] overflow-y-scroll scrollbar-thin scrollbar-thumb-[#c1a38f] scrollbar-thumb-rounded-full scrollbar-track-[#f5f5f5] scrollbar-track-rounded-full hover:scrollbar-thumb-[#a78974]">
      <ul className="w-full min-w-0 divide-y divide-[#e8dcd4]">
        {appointments.length > 0 ? (
          appointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onEdit={onEdit}
              onInfo={onInfo}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="p-6 text-center text-[#5f4b5a] font-[CaviarDreams]">
            No upcoming appointments.
          </div>
        )}
      </ul>
    </div>
  </div>
);

export default AppointmentList;
