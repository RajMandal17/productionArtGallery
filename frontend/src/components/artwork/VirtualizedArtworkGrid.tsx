import React, { memo } from 'react';
import ArtworkCard from './ArtworkCard';
import { Artwork } from '../../types';
import { AutoSizer, List, WindowScroller, ListRowProps } from 'react-virtualized';

interface ArtworkGridProps {
  artworks: Artwork[];
  loading?: boolean;
  emptyMessage?: string;
}

// Calculate items per row based on viewport width
const getItemsPerRow = (width: number) => {
  if (width < 640) return 1; // Mobile
  if (width < 1024) return 2; // Tablet
  if (width < 1280) return 3; // Small desktop
  return 4; // Large desktop
};

const ArtworkGrid: React.FC<ArtworkGridProps> = ({ 
  artworks, 
  loading = false,
  emptyMessage = "No artworks found"
}) => {
  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Show empty state
  if (!artworks || artworks.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  // Render virtualized grid
  const rowRenderer = ({ index, key, style, width }: ListRowProps & { width: number }) => {
    const itemsPerRow = getItemsPerRow(width);
    const fromIndex = index * itemsPerRow;
    const toIndex = Math.min(fromIndex + itemsPerRow, artworks.length);
    
    // Array of artworks for this row
    const rowArtworks = artworks.slice(fromIndex, toIndex);
    
    return (
      <div 
        key={key} 
        style={style} 
        className="flex flex-wrap justify-start"
      >
        {rowArtworks.map((artwork) => (
          <div 
            key={artwork.id} 
            className={`p-2 ${
              itemsPerRow === 1 ? 'w-full' : 
              itemsPerRow === 2 ? 'w-1/2' : 
              itemsPerRow === 3 ? 'w-1/3' : 
              'w-1/4'
            }`}
          >
            <ArtworkCard artwork={artwork} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <WindowScroller>
      {({ height, isScrolling, onChildScroll, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => {
            const itemsPerRow = getItemsPerRow(width);
            const rowCount = Math.ceil(artworks.length / itemsPerRow);
            
            return (
              <List
                autoHeight
                height={height}
                isScrolling={isScrolling}
                onScroll={onChildScroll}
                rowCount={rowCount}
                rowHeight={330} // Approximate height of a card
                rowRenderer={(props) => rowRenderer({ ...props, width })}
                scrollTop={scrollTop}
                width={width}
                overscanRowCount={2}
              />
            );
          }}
        </AutoSizer>
      )}
    </WindowScroller>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(ArtworkGrid);
