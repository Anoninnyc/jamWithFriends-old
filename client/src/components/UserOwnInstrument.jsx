import React, { Component } from 'react';
import { keys } from '../utils/helperFunctions';

const UserOwnInstrument = () => (
  <div>
   {keys.map((key, idx) => (
     <div className="key" key={idx+1} id={idx+1}>{key}</div>
    ))}
  </div>
  );

export default UserOwnInstrument;
