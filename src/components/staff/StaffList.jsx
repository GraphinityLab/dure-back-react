/* eslint-disable no-unused-vars */
import React from 'react';

import StaffCard from './StaffCard';

const StaffList = ({ staffArray, onEdit, onDelete, onMoreInfo }) => {
  if (!staffArray || staffArray.length === 0) {
    return <p className="text-center text-gray-500 mt-6">No staff available.</p>;
  }

  return (
    <ul className="space-y-2">
      {staffArray.map((staff) => (
        <StaffCard
          key={staff?.staff_id || Math.random()} // fallback key
          staff={staff}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoreInfo={onMoreInfo}
        />
      ))}
    </ul>
  );
};

export default StaffList;
