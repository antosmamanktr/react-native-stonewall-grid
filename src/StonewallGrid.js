import React, {useEffect, useState} from 'react';
import {Dimensions, Image, ScrollView, View, StyleSheet} from 'react-native';
const {width: screenWidth} = Dimensions.get('window');
const imageSizeCache = {};

const StonewallGrid = ({
  data = [],
  renderItem,
  columns = 2,
  horizontalSpacing = 12,
  verticalSpacing = 12,
  paddingHorizontal = 12,
  paddingVertical = 12,
  offsetFirstTileInColumn = 1,
  offsetMargin = 0,
}) => {
  const [columnedData, setColumnedData] = useState([]);

  const totalHorizontalSpacing = horizontalSpacing * (columns - 1);
  const availableWidth = screenWidth - paddingHorizontal * 2 - totalHorizontalSpacing;
  const cardWidth = availableWidth / columns;

  useEffect(() => {
    const loadImageSizes = async () => {
      const itemsWithHeights = await Promise.all(
        data.map((item, index) => {
          const uri = item.a_image || item.image?.uri;
          const localImage = typeof item.image === 'number' ? item.image : null;

          return new Promise(resolve => {
            const finalize = (w, h) => {
              const aspectRatio = h / w;
              const scaledHeight = cardWidth * aspectRatio;
              resolve({...item, height: scaledHeight, originalIndex: index});
            };

            if (uri && imageSizeCache[uri]) {
              const {width, height} = imageSizeCache[uri];
              const aspectRatio = height / width;
              const scaledHeight = cardWidth * aspectRatio;
              return resolve({...item, height: scaledHeight, originalIndex: index});
            }

            if (localImage) {
              const {width, height} = Image.resolveAssetSource(localImage);
              return finalize(width, height);
            }

            if (uri) {
              Image.getSize(
                uri,
                (w, h) => {
                  imageSizeCache[uri] = {width: w, height: h};
                  finalize(w, h);
                },
                () => resolve({...item, height: 200, originalIndex: index}),
              );
            } else {
              resolve({...item, height: 200, originalIndex: index});
            }
          });
        }),
      );

      const columnsData = Array.from({length: columns}, () => []);
      const columnsHeight = Array(columns).fill(0);

      itemsWithHeights.forEach(item => {
        const shortestColumn = columnsHeight.indexOf(Math.min(...columnsHeight));
        columnsData[shortestColumn].push(item);
        columnsHeight[shortestColumn] += item.height + verticalSpacing;
      });

      setColumnedData(columnsData);
    };

    loadImageSizes();
  }, [data, cardWidth, columns, verticalSpacing]);

  const getTopMargin = (colIndex, itemIndex) => {
    return colIndex === offsetFirstTileInColumn && itemIndex === 0 ? offsetMargin : 0;
  };
  const getRightMargin = colIndex => {
    return colIndex < columns - 1 ? horizontalSpacing : 0;
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal,
        paddingVertical,
      }}>
      <View style={styles.columns}>
        {columnedData.map((column, colIndex) => (
          <View
            key={`col-${colIndex}`}
            style={[
              {
                width: cardWidth,
                marginRight: getRightMargin(colIndex),
              },
            ]}>
            {column.map((item, itemIndex) => (
              <View
                key={item.id || `${colIndex}-${itemIndex}`}
                style={[
                  {
                    marginBottom: verticalSpacing,
                    marginTop: getTopMargin(colIndex, itemIndex),
                  },
                ]}>
                {renderItem(item, item.originalIndex, colIndex)}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default StonewallGrid;
export const styles = StyleSheet.create({
  scroll: {},
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});