import React from 'react';
import Avatar from 'boring-avatars';

interface PlayerAvatarProps {
  name: string;
  size?: number;
  playerColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PlayerAvatar = ({ name, size = 40, playerColor = '#A7F3D0', className = '', style = {} }: PlayerAvatarProps) => {
  // We use a nice pastel palette and mix the player's assigned color into it
  // to ensure their avatar somewhat matches their drawing color
  const palette = ['#ffecd6', '#ffbfa3', playerColor, '#93C5FD', '#C4B5FD'];

  return (
    <div 
      className={`relative inline-block rounded-full shadow-inner bg-white overflow-hidden ${className}`} 
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      <Avatar
        size={size}
        name={name}
        variant="beam"
        colors={palette}
      />
    </div>
  );
};
